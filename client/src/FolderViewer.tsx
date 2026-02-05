import { toast } from "sonner";
import { LockAlert } from "./components/ui/lock-alert";
import { useContext, useState } from "react";
import { getFolder } from "./api/requests";
import { ConfigContext } from "./store/config";
import { ScrollArea } from "./components/ui/scroll-area";
import { Button } from "./components/ui/button";
import { Folder, File } from "lucide-react";
import { ItemOptions } from "./components/ui/path";
import { useQuery } from "@tanstack/react-query";


export function FolderViewer() {
  const context = useContext(ConfigContext);
  const [lockPassword, setLockPassword] = useState(null as string | null);
  const { error, data } = useQuery({
    queryKey: ["folder", context, lockPassword],
    queryFn: async () => {
      setIsLocked(false);
      return await getFolder(context.mainState.content!.path, lockPassword, () => { 
        if (lockPassword !== null) toast.error("Wrong password");
        setIsLocked(true) 
      });
    }
  })
  const [isLocked, setIsLocked] = useState(false);


  if (error) toast.error("Cannot get folder");
  return (
    <div className="flex flex-col w-full flex-1 space-y-2">
      {isLocked ? <LockAlert setLockPassword={setLockPassword} /> : <></>}
      <ItemOptions lock={lockPassword} />
      {data &&
        data.length != 0 ?
        <ScrollArea className="w-full">
          {data.map((x, i) => {
            return (
              <>
                <Button
                  lock={i}
                  variant={"ghost"}
                  className="flex justify-start hover:cursor-pointer w-full"
                  onClick={() => context.mainState.setContent({
                    type: x.type,
                    path: `${context.mainState.content!.path}/${x.name}`,
                  })}
                >
                  {x.type === "file" ? <File size={"20px"} fill={context.primaryColor} strokeWidth={0} /> : <Folder fill={context.primaryColor} strokeWidth={0} />}
                  <h1>{x.name.split(".")[0]}</h1>
                </Button>
                {i < data?.length - 1 ? <hr /> : <></>}
              </>
            )
          })}
        </ScrollArea> :
        <div className="flex flex-1 items-center justify-center w-full">
          <h1 className="font-bold text-4xl opacity-25">Empty folder</h1>
        </div>}
    </div>
  )
}