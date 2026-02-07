import json
from llama_cpp import Llama
import os
import sys

MODEL_PATH = os.getenv("MYFILES_AI_MODEL_PATH")
if not MODEL_PATH:
    print("Warning: MYFILES_AI_MODEL_PATH variable not set, askai endpoints require this variable", file=sys.stderr)

N_CTX = 4096
N_BATCH = 64
N_THREADS = 4
N_GPU_LAYERS = -1


llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=N_CTX,
    n_batch=N_BATCH,
    n_threads=N_THREADS,
    n_gpu_layers=N_GPU_LAYERS
) if MODEL_PATH else None

async def generate_stream(system: str, prompt: str):
    if not llm:
        raise RuntimeError("llm not initialized")
    for token in llm.create_chat_completion(
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt}
        ],
        stream=True,
        max_tokens=0
    ):
        if isinstance(token, dict):
            if "content" in token["choices"][0]["delta"]:
                yield token["choices"][0]["delta"]["content"]   # type: ignore