import { useContext, useState } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { NoteContext } from "@/pages/notes/store/config";

type Prop = {
  setLockPassword: (x: string) => void,
}

export function LockAlert({ setLockPassword }: Prop) {
  const [open, setOpen] = useState(true);
  const [password, setPassword] = useState("");
  const context = useContext(NoteContext);
  if (context.content === null) return;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>This {context.content?.type} is locked</DialogTitle>
          <DialogDescription>
            Write the password to unlock the file
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-3">
          <Label>
            Password
          </Label>
          <Input onKeyDown={(e) => {
            if (e.key === "Enter")
              setLockPassword(password);
          }} type="password" onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <DialogFooter>
          <Button onClick={() => {setOpen(false); context.setContent(null)}}>Cancel</Button>
          <Button onClick={() => {setLockPassword(password)}}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
