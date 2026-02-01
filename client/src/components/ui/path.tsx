import { Delete, DeleteIcon, Download, Trash, Trash2 } from "lucide-react";
import type { ShowObject } from "../../App"
import { Button } from "./button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { NewItem } from "./new-item";

type Prop = {
    path: string,
    type: "file" | "directory",
    setContent: (x: ShowObject) => void
}

export function ItemOptions({ path, setContent, type }: Prop) {
    const split = path.split("/");
    split[split.length - 1] = split[split.length - 1].split(".")[0];
    return (
        <div className="flex justify-between">
            <div className="flex items-center">
                {
                    split.map((e, i) => {
                        return (
                            <>
                                <Button
                                    className="hover:text-accent"
                                    size="lg"
                                    variant="link"
                                    onClick={() => setContent({
                                        path: split.slice(0, i + 1).join("/"),
                                        type: "directory",
                                        isLocked: false
                                    })}
                                >
                                    <h2 className="text-2xl">{e}</h2>
                                </Button>
                                {i < split.length - 1 ? <h2 className="text-2xl">/</h2> : <></>}
                            </>
                        );
                    })
                }
            </div>
            <div className="flex items-center space-x-2">
                {
                    type === "directory" ? 
                    <>
                        <NewItem type="file" path={path + "/"} onChange={() => {}} variant="big"/>
                        <NewItem type="directory" path={path + "/"} onChange={() => {}} variant="big" />
                    </>
                    :
                    <></>
                }
                <Button variant="outline" className="text-accent">
                    <Download />
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { }}>Cancel</Button>
                            <Button variant="destructive" onClick={() => { }}>Confirm</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}