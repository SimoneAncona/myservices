import { FilePlus, FolderPlus } from "lucide-react"
import { Button } from "./button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { Label } from "./label"
import { Input } from "./input"
import { useState } from "react"
import { getFile, getFiles, getFolder, upsertFile, upsertFolder } from "../../api/requests"
import { toast } from "sonner"

type Prop = {
    type: "file" | "directory",
    path: string,
    onChange: (() => Promise<void>) | (() => void),
    variant?: "big" | "small"
}

export function NewItem({ type, path, onChange, variant } : Prop) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant === "big" ? "outline" : "ghost"} className={variant === "big" ? "" : "size-7"}>
                    {type === "file" ? <FilePlus /> : <FolderPlus />}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New {type}</DialogTitle>
          </DialogHeader>
          <Label>Name</Label>
          <Input type="text" onChange={(e) => setName(e.target.value)} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button 
                type="submit"
                onClick={async () => {
                    try {
                        const files = await getFolder(path, null);
                        const alreadyExists = files.filter(x => x.name == name + (type === "file" ? ".md" : ""))
                        if (alreadyExists.length !== 0)
                            toast.error(`The ${type} already exists`);
                        else {
                            if (type === "file") await upsertFile(path + name + ".md", null, new Blob());
                            else await upsertFolder(path + name, null);
                            onChange();
                            setOpen(false);
                        }
                    } catch {
                        toast.error("Cannot create new item");
                        setOpen(false);
                    }
                    
                }
                }
            >
            Create
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}