import { toast } from "sonner";
import { LockAlert } from "../../components/ui/lock-alert";
import { useContext, useEffect, useState } from "react";
import { getFolder } from "../../api/requests";
import { Button } from "../../components/ui/button";
import { Folder, File } from "lucide-react";
import { ItemOptions } from "../../components/ui/path";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { Kbd, KbdGroup } from "../../components/ui/kbd";
import { NoteContext } from "./store/config";


export function FolderViewer() {
  const context = useContext(NoteContext);
  const [lockPassword, setLockPassword] = useState(null as string | null);
  const { error, data } = useQuery({
    queryKey: ["folder", context, lockPassword],
    queryFn: async () => {
      setIsLocked(false);
      return await getFolder(context.content!.path, lockPassword, () => { 
        if (lockPassword !== null) toast.error("Wrong password");
        setIsLocked(true) 
      });
    }
  })
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!data) return;
      const key = Number(e.key);
      if (e.altKey && !Number.isNaN(key)) {
        e.preventDefault();
        context.setContent({
          path: `${context.content!.path}/${data[key - 1].name}`,
          type: data[key - 1].type
        })
      }
      if (e.ctrlKey && e.key === "ArrowLeft") {
        e.preventDefault();
        const split = context.content!.path.split("/");
        split.pop();
        if (split.length === 0) {
          context.setContent(null);
          return;
        }
        context.setContent({
          path: split.join("/"),
          type: "directory"
        })
      }
    }
    document.addEventListener("keydown", handleKeys, true);
    return () => { document.removeEventListener("keydown", handleKeys, true); }
  })


  if (error) toast.error("Cannot get folder");
  return (
    <div className="flex flex-col w-full flex-1 space-y-2 h-full">
      {isLocked ? <LockAlert setLockPassword={setLockPassword} /> : <></>}
      <ItemOptions lock={lockPassword} onDownload={() => {}} />
      {data &&
        data.length != 0 ?
        <div className="w-full space-y-1 overflow-y-auto">
          {data.map((x, i) => {
            const button = <Button
                  key={i}
                  variant={"ghost"}
                  className="flex justify-start hover:cursor-pointer w-full"
                  onClick={() => context.setContent({
                    type: x.type,
                    path: `${context.content!.path}/${x.name}`,
                  })}
                >
                  {x.type === "file" ? <File size={"20px"} fill="var(--accent)" strokeWidth={0} /> : <Folder fill="var(--accent)" strokeWidth={0} />}
                  <h1>{x.name.split(".")[0]}</h1>
                </Button>
            return (
              <>
                {i < 9 ? 
                  <Tooltip delayDuration={700}>
                    <TooltipTrigger className="w-full">
                      {button} 
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <KbdGroup>
                        <Kbd>ALT</Kbd>
                        <span>+</span>
                        <Kbd>{i + 1}</Kbd>
                      </KbdGroup>
                    </TooltipContent>
                  </Tooltip>
                  : button
                }
                {i < data?.length - 1 && <hr />}
              </>
            )
          })}
        </div> :
        <div className="flex flex-1 items-center justify-center w-full">
          <h1 className="font-bold text-4xl opacity-25">Empty folder</h1>
        </div>}
    </div>
  )
}