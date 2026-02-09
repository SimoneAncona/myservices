import { toast } from "sonner";
import { LockAlert } from "@/components/ui/lock-alert";
import { useContext, useEffect, useState } from "react";
import { getFolder } from "@/api/requests";
import { Button } from "@/components/ui/button";
import { Folder, File } from "lucide-react";
import { ItemOptions } from "@/components/ui/notes/path";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { NoteContext } from "@/pages/notes/store/config";
import { FileContext } from "@/components/ui/notes/right-context";


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
      if ((e.altKey && !e.ctrlKey && context.currentWindow === "left" || e.altKey && e.ctrlKey && context.currentWindow === "right") && !Number.isNaN(key)) {
        e.preventDefault();
        context.setContent({
          path: `${context.content!.path}/${data[key - 1].name}`,
          type: data[key - 1].type
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
            const button = 
              <FileContext path={`${context.content!.path}/${x.name}`} type={x.type}>
                <Button
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
              </FileContext>
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
                        {context.currentWindow === "right" && <>
                          <span>+</span>
                          <Kbd>CTRL</Kbd>
                        </>}
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