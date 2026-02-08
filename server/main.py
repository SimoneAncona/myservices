import os
from pathlib import Path
from typing import Literal
from fastapi import Body, Depends, FastAPI, File, Form, HTTPException, Header, Query, Response, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, model_validator
from fastapi.middleware.cors import CORSMiddleware
from src.ai import generate_stream
import sys
import zipfile
import time

app = FastAPI()

ORIGINS = os.getenv("MYFILES_ORIGINS")
if not ORIGINS:
    print("Warning: MYFILES_ORIGINS variabile not set, fallback to \"*\"", file=sys.stderr)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS.split(",") if ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT_DIR = os.getenv("MYFILES_ROOT_DIR")

if not ROOT_DIR:
    raise RuntimeError("MYFILES_ROOT_DIR variable must be set")

ROOT_PATH = Path(ROOT_DIR).resolve()
FILE_ROOT_PATH = (ROOT_PATH / "files").resolve()
DATA_ROOT_PATH = (ROOT_PATH / "data").resolve()
CONFIG_PATH = (DATA_ROOT_PATH / "conf.json").resolve()

if not ROOT_PATH.exists():
    os.mkdir(ROOT_PATH)

if not FILE_ROOT_PATH.exists():
    os.mkdir(FILE_ROOT_PATH)

if not DATA_ROOT_PATH.exists():
    os.mkdir(DATA_ROOT_PATH)

def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])

class CamelModel(BaseModel):
    class Config:
        alias_generator = to_camel
        validate_by_name = True


class ConfigBase(CamelModel):
    primary_color: Literal[
        "neutral",
        "red",
        "green",
        "blue",
        "yellow",
        "cyan",
        "magenta"
    ] = "neutral"
    theme: Literal["light", "dark", "system"] = "light"
    delete_confirmation: bool = True
    standalone: bool = False

class ConfigModel(ConfigBase):
    token: str | None = None

class ConfigResponse(ConfigBase):
    auth: bool
    askai: bool

    @model_validator(mode="before")
    @classmethod
    def compute_auth(cls, data):
        if isinstance(data, dict):
            token = data.get("token")
        else:
            token = getattr(data, "token", None)

        data = dict(data)
        data["auth"] = token is not None
        return data
    
    @model_validator(mode="before")
    @classmethod
    def compute_askay(cls, data):
        data = dict(data)
        data["askai"] = os.getenv("MYFILES_AI_MODEL_PATH") is not None
        return data
    
class KeyModel(CamelModel):
    key: str

class TokenModel(CamelModel):
    token: str

class PromptModel(CamelModel):
    prompt: str

class PromptKeyModel(CamelModel):
    prompt: str
    key: str | None = None

def save_config(config: ConfigModel):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        f.write(config.model_dump_json(indent=2))

def load_config() -> ConfigModel: 
    if not CONFIG_PATH.exists():
        config = ConfigModel()
        save_config(config)
        return config

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return ConfigModel.model_validate_json(f.read())
    
data = load_config()

def list_directory(path: Path):
    if not path.exists() or not path.is_dir():
        raise HTTPException(status_code=404, detail="Directory not found")

    entries = sorted(
        path.iterdir(),
        key=lambda e: (not e.is_dir(), e.name.lower())
    )

    items = []
    for entry in entries:
        if entry.suffix == ".lock":
            continue
        items.append({
            "name": entry.name,
            "type": "directory" if entry.is_dir() else "file",
            "isLocked": entry.with_suffix(entry.suffix + ".lock").exists()
        })
    return items


def create_file(path: Path, file: bytes):
    if not path.exists():
        try:
            with open(path, "xb") as f:
                f.write(file)
            return
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Path not found")

    if path.is_file():
        with open(path, "wb") as f:
            f.write(file)
        return
    
    if path.is_dir():
        raise HTTPException(status_code=400, detail="Path is a directory")
    
def create_dir(path: Path):
    if not path.exists():
        try:
            os.mkdir(path)
            return
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Path not found")

    if path.is_file():
        raise HTTPException(status_code=400, detail="Path is a file")
    
    if path.is_dir():
        raise HTTPException(status_code=400, detail="Directory already exists")

def check_lock(path: Path, key: str | None):
    key_path = path.with_suffix(path.suffix + ".lock")
    if key_path.exists():
        if not key:
            raise HTTPException(status_code=403, detail="Key not provided")
        with open(key_path, "r") as key_file:
            if key_file.read() != key:
                raise HTTPException(status_code=403, detail="Key is not valid")
            
def zip_directory(directory_path, zip_path):
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for root, dirs, files in os.walk(directory_path):
            for file in files:
                zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), os.path.join(directory_path, '..')))

def list_files(startpath: Path):
    startpath = Path(startpath)
    res = ""

    for root in startpath.rglob('*'):
        if root.is_dir():
            level = len(root.relative_to(startpath).parts)
            indent = '-' * 4 * level
            res += f"{indent} DIR - {root.name}\n"
        else:
            level = len(root.parent.relative_to(startpath).parts)
            indent = '-' * 4 * (level + 1)
            res += f"{indent} FILE - {root.name}\n"

    return res

def auth_required(authorization: str | None = Header(None)):
    if data.token is None:
        return

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer" or parts[1] != data.token:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/files", dependencies=[Depends(auth_required)])
def get_root_files():
    return list_directory(FILE_ROOT_PATH)


@app.post("/files/{subpath:path}", dependencies=[Depends(auth_required)])
def get_sub_notes(subpath: str, key: KeyModel | None = Body(default=None)):
    target_path = (FILE_ROOT_PATH / subpath).resolve()
    
    check_lock(target_path, None if key is None else key.key)
    
    if target_path.is_file():
        with open(target_path, "r", encoding="utf-8") as f:
            return Response(f.read(), media_type='application/octet-stream')

    return list_directory(target_path)

@app.post("/zip/{subpath:path}", dependencies=[Depends(auth_required)])
def zip_folder(subpath: str, key: KeyModel | None = Body(default=None)):
    target_path = (FILE_ROOT_PATH / subpath).resolve()
    
    check_lock(target_path, None if key is None else key.key)
    
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Directory not found")

    if target_path.is_file():
        raise HTTPException(status_code=400, detail="Path is a file")

    try:
        zip_path = (FILE_ROOT_PATH / f"tmp{time.time()}.zip").resolve()
        zip_directory(target_path, zip_path)
        with open(zip_path, "rb") as f:
            return Response(f.read(), media_type='application/zip')
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="An error occurred")
    finally:
        os.remove(zip_path)

@app.put("/files/{subpath:path}", dependencies=[Depends(auth_required)], status_code=204)
async def put_file(subpath: str, key: str | None = Form(default=None), file: UploadFile | None = File(default=None)):
    target_path = (FILE_ROOT_PATH / subpath).resolve()

    check_lock(target_path, key)
    check_lock(target_path.parent, key)

    if target_path.suffix == ".lock":
        raise HTTPException(status_code=400, detail="Invalid filename")
    if not file:
        create_dir(target_path)
        return
    create_file(target_path, await file.read())

@app.delete("/files/{subpath:path}", dependencies=[Depends(auth_required)], status_code=204)
def delete(subpath: str, key: KeyModel | None = Body(default=None)):
    target_path = (FILE_ROOT_PATH / subpath).resolve()
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    
    check_lock(target_path, None if key is None else key.key)
    key_path = target_path.with_suffix(target_path.suffix + ".lock")
    if key_path.exists():
        os.remove(key_path)
    
    if target_path.is_dir():
        for root, dirs, files in os.walk(target_path, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(target_path)
        return
    
    os.remove(target_path)

@app.get("/config", dependencies=[Depends(auth_required)])
def get_config():
    return ConfigResponse.model_validate(data, from_attributes=True)

@app.put("/config", dependencies=[Depends(auth_required)], status_code=204)
def update_config(conf: ConfigBase = Body()):
    global data
    data = ConfigModel(**conf.model_dump(), token=data.token)
    save_config(data)

@app.patch("/config/token", dependencies=[Depends(auth_required)], status_code=204)
def patch_token(token: TokenModel = Body()):
    global data
    data.token = token.token
    save_config(data)

@app.put("/locks/{subpath:path}", dependencies=[Depends(auth_required)], status_code=204)
def lock(subpath: str, key: KeyModel = Body()):
    target_path = (FILE_ROOT_PATH / subpath).resolve()
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    target_path = target_path.with_suffix(target_path.suffix + ".lock")
    create_file(target_path, key.key.encode())

@app.get("/version", dependencies=[Depends(auth_required)])
def version():
    return 0

@app.post("/askai", dependencies=[Depends(auth_required)])
async def generate(prompt: PromptModel = Body()):
    system_prompt = f"""
    You are a generic assistant, your task is to receive questions and reply with
    maximum accuracy
    """

    return StreamingResponse(generate_stream(prompt=prompt.prompt, system=system_prompt), media_type="text/plain")

@app.post("/askai/{subpath:path}", dependencies=[Depends(auth_required)])
async def ask_ai_files(subpath: str, body: PromptKeyModel):
    target_path = (FILE_ROOT_PATH / subpath).resolve()
    
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    
    check_lock(target_path, body.key)


    if target_path.is_file():
        system_prompt = f"""
        You are a useful assistant, your task is to read the following file and
        reply to the user questions as best as you can, one question could be: can
        you make a summary of this file?

        ======================= STARTING FILE ==========================
        {{file}}
        ======================= END OF FILE ============================
        """
        with open(target_path, "r", encoding="utf-8") as f:
            return StreamingResponse(generate_stream(system=system_prompt.replace("{file}", f.read()), prompt=body.prompt), media_type="text/plain")

    else:
        system_prompt = f"""
        You are a useful assistant, your task is to read the folder structure
        and help the user find files or more, one question could be: where
        is the note about German history 1800-1850

        The folder structure uses `-' to indicate the depth level, and DIR - or
        FILE - to indicate the type of item

        ======================= STARTING FOLDER TREE ==========================
        {{folder}}
        ======================= END OF FOLDER TREE ============================
        """
        return StreamingResponse(generate_stream(system=system_prompt.replace("{folder}", list_files(target_path)), prompt=body.prompt), media_type="text/plain")