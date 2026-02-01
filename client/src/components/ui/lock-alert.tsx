import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./alert-dialog";
import { Input } from "./input";
import { Label } from "./label";

type Prop = {
  type: "file" | "directory",
  setLockPassword: (x: string) => void
}

export function LockAlert({type, setLockPassword}: Prop) {
  const [open, setOpen] = useState(true);
  const [password, setPassword] = useState("");
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>This {type} is locked</AlertDialogTitle>
          <AlertDialogDescription>
            Write the password to unlock the file
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col space-y-3">
          <Label>
            Password
          </Label>
          <Input type="password" onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {setOpen(false)}}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            setLockPassword(password);
            setOpen(false);
          }}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
