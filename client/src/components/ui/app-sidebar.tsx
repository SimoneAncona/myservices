import { NotebookPen, File, Folder, /*Settings,*/ LockKeyholeIcon } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "./sidebar"
import { useContext, useEffect } from "react"
import { getFiles } from "../../api/requests";
import { toast } from "sonner";
import { Skeleton } from "./skeleton";
import { Button } from "./button";
import { ConfigContext } from "../../store/config";
import { NewItem } from "./new-item";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Kbd, KbdGroup } from "./kbd";

export function AppSidebar() {
  const context = useContext(ConfigContext);
  const { isError, data } = useQuery({
    queryKey: ["root"],
    queryFn: getFiles
  })
  const queryClient = useQueryClient();
  if (isError) toast.error("Cannot get root");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!data) return
      const key = Number(e.key);
      if (e.ctrlKey && !Number.isNaN(key)) {
        e.preventDefault();
        context.mainState.setContent({
          path: data[key - 1].name,
          type: data[key - 1].type
        })
      }
    }
    document.addEventListener("keydown", handleKey, true);
    return () => { document.removeEventListener("keydown", handleKey, true); }
  })

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
            !data ?
              <>
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </>
              : <>
              <div className="flex items-center space-x-3">
                <p>root</p>
                <hr className="w-full"/>
                <NewItem type="file" path="" onChange={() => {queryClient.invalidateQueries({queryKey: ["root"]})}} />
                <NewItem type="directory" path="" onChange={() => {queryClient.invalidateQueries({queryKey: ["root"]})}} />
              </div>
                {data.map((x, i) => {
                  const button = <Button
                      variant={"ghost"}
                      className="flex justify-start overflow-x-clip w-full"
                      onClick={() => context.mainState.setContent({
                        type: x.type,
                        path: x.name,
                      })}
                    >
                      {x.type === "file" ? <File className="size-5" fill={context.primaryColor} strokeWidth={0} /> : <Folder className="size-5" fill={context.primaryColor} strokeWidth={0} />}
                      {x.isLocked ? <LockKeyholeIcon className="absolute translate-2 text-amber-800" fill="#EFBF04" strokeWidth={2} /> : <></>}
                      {x.name.split(".")[0]}
                    </Button>
                  return (
                    <>
                    {i < 9 ?
                      <Tooltip delayDuration={700}>
                        <TooltipTrigger asChild>
                          {button}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <KbdGroup>
                            <Kbd>CTRL</Kbd>
                            <span>+</span>
                            <Kbd>{i + 1}</Kbd>
                          </KbdGroup>
                        </TooltipContent>
                      </Tooltip>
                    : {button} }
                    </>
                    
                  )
                })}
              </>
          }
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* <Button className="bg-accent">
          <Settings />
          Settings
        </Button> */}
        <p className="font-mono text-sm text-primary/50">v0.1</p>
      </SidebarFooter>
    </Sidebar>
  )
}