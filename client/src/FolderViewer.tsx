import { toast } from "sonner";
import { LockAlert } from "./components/ui/lock-alert";
import { useContext, useEffect, useState } from "react";
import { getFolder } from "./api/requests";
import { ConfigContext } from "./ctx/config";
import type { FolderItem } from "./models/requests";
import { ScrollArea } from "./components/ui/scroll-area";
import { Button } from "./components/ui/button";
import type { ShowObject } from "./App";
import { Folder, File } from "lucide-react";
import { getColor } from "./lib/utils";
import { ItemOptions } from "./components/ui/path";

type Prop = {
  path: string,
  isLocked: boolean,
  setShow: (x: ShowObject) => void;
}

export function FolderViewer({ path, isLocked, setShow }: Prop) {
  const [data, setData] = useState(null as FolderItem[] | null);
  const [lockPassword, setLockPassword] = useState(null as string | null);
  const [error, setError] = useState(false);
  const context = useContext(ConfigContext);
  const accentColor = getColor(context.primaryColor);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(await getFolder(path, lockPassword));
      } catch {
        setError(true);
      }
    }
    fetchData();
  }, [path, lockPassword]);

  if (error) toast.error("Cannot get folder");
  return (
    <div className="flex flex-col w-full flex-1">
      {isLocked ? <LockAlert type="file" setLockPassword={setLockPassword}/> : <></>}
      <ItemOptions path={path} setContent={setShow} type="directory"/>
      {data !== null ? 
        data.length != 0 ?
          <ScrollArea className="w-full">
            {data.map(x => {
                  return (
                    <Button 
                      variant={"ghost"} 
                      className="flex justify-start hover:cursor-pointer w-full"
                      onClick={() => setShow({
                        type: x.type,
                        path: `${path}/${x.name}`,
                        isLocked: x.isLocked
                      })}
                    >
                      {x.type === "file" ? <File size={"20px"} fill={accentColor} strokeWidth={0} /> : <Folder fill={accentColor} strokeWidth={0} /> }
                      <h1>{x.name.split(".")[0]}</h1>
                    </Button>
                  )
                })}
          </ScrollArea> : 
          <div className="flex flex-1 items-center justify-center w-full">
            <h1 className="font-bold text-4xl opacity-25">Empty folder</h1>
          </div>
          :<></>}
    </div>
  )
}