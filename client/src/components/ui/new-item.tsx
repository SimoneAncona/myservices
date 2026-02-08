import { FilePlus, FolderPlus } from "lucide-react"
import { Button } from "./button"
import { Dialog, DialogClose, DialogContent,  DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { Label } from "./label"
import { Input } from "./input"
import { useContext, useEffect, useState } from "react"
import { getFolder, upsertFile, upsertFolder } from "../../api/requests"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { Kbd, KbdGroup } from "./kbd"
import { NoteContext } from "@/pages/notes/store/config"

type Prop = {
    type: "file" | "directory",
    path: string,
    onChange: (() => Promise<void>) | (() => void),
    variant?: "big" | "small"
}

export function NewItem({ type, path, onChange, variant } : Prop) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const context = useContext(NoteContext);

    const createItem = async () => {
        try {
            const files = await getFolder(path, null);
            if (!files) {
                toast.error("Error creating new item");
                return;
            }
            const alreadyExists = files.filter(x => x.name == name + (type === "file" ? ".note" : ""))
            if (alreadyExists.length !== 0)
                toast.error(`The ${type} already exists`);
            else {
                if (type === "file") await upsertFile(path + name + ".note", null, new Blob());
                else await upsertFolder(path + name, null);
                onChange();
                setOpen(false);
            }
        } catch {
            toast.error("Cannot create new item");
            setOpen(false);
        }
        
    };

    
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (path === "" && context.content) return;
            if (e.ctrlKey && e.key === "g" && type === "file") {
                e.preventDefault();
                setOpen(true);
            }
            if (e.ctrlKey && e.key === "d" && type === "directory") {
                e.preventDefault();
                setOpen(true);
            }
        }
        document.addEventListener("keydown", handleKeyPress, true);

        return () => { document.removeEventListener("keydown", handleKeyPress, true) }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                        <Button onClick={() => { setOpen(true) }} variant={variant === "big" ? "outline" : "ghost"} className={variant === "big" ? "" : "size-7"}>
                            {type === "file" ? <FilePlus /> : <FolderPlus />}
                        </Button>
                    </TooltipTrigger>
                    {(path !== "" || (path === "" && !context.content)) && <TooltipContent>
                        <KbdGroup>
                            <Kbd>CTRL</Kbd>
                            <span>+</span>
                            <Kbd>{type === "file" ? "G" : "D"}</Kbd>
                        </KbdGroup>
                    </TooltipContent>}
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{path === "" ? `Create new ${type} in the root` : `New ${type}`}</DialogTitle>
          </DialogHeader>
          <Label>Name</Label>
          <Input onKeyDown={async e => {
            if (e.key === "Enter")
                await createItem();
          }} type="text" onChange={(e) => setName(e.target.value)} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button 
                type="submit"
                onClick={async () => await createItem()}
            >
            Create
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}