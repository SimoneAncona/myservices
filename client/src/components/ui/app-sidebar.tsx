import { NotebookPen, File, Folder, Settings, FilePlus, FolderPlus } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "./sidebar"
import type { FolderItem } from "../../models/requests"
import { useCallback, useContext, useEffect, useState } from "react"
import { getFiles } from "../../api/requests";
import { toast } from "sonner";
import { Skeleton } from "./skeleton";
import { Button } from "./button";
import { ConfigContext } from "../../ctx/config";
import type { ShowObject } from "../../App";
import { getColor } from "../../lib/utils";
import { NewItem } from "./new-item";

type Prop = {
  setShow: (x: ShowObject) => void;
}

export function AppSidebar({ setShow }: Prop) {
  const [data, setData] = useState(null as FolderItem[] | null);
  const context = useContext(ConfigContext);
  const accentColor = getColor(context.primaryColor);

  const fetchData = useCallback(async () => {
    try {
      setData(await getFiles());
    } catch {
      toast.error("Cannot get notes");
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex gap-2 items-center">
          <NotebookPen />
          <h1 className="font-bold text-xl">MY NOTES</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="space-y-1">
          {
            data === null ?
              <>
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </>
              : <>
              <div className="flex items-center space-x-3">
                <p>root</p>
                <hr className="w-full"/>
                <NewItem type="file" path="" onChange={fetchData} />
                <NewItem type="directory" path="" onChange={fetchData} />
              </div>
                {data.map(x => {
                  return (
                    <Button
                      variant={"ghost"}
                      className="flex justify-start"
                      onClick={() => setShow({
                        type: x.type,
                        path: x.name,
                        isLocked: x.isLocked
                      })}
                    >
                      {x.type === "file" ? <File fill={accentColor} strokeWidth={0} /> : <Folder fill={accentColor} strokeWidth={0} />}
                      <h1>{x.name.split(".")[0]}</h1>
                    </Button>
                  )
                })}
              </>
          }
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button className="bg-accent">
          <Settings />
          Settings
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}