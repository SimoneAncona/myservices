import { NotebookPen, File, Folder, /*Settings,*/ LockKeyholeIcon, Settings } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, useSidebar } from "./sidebar"
import { useContext, useEffect, useState } from "react"
import { getFiles, updateConfig } from "../../api/requests";
import { toast } from "sonner";
import { Skeleton } from "./skeleton";
import { Button } from "./button";
import { NewItem } from "./new-item";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Kbd, KbdGroup } from "./kbd";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Label } from "./label";
import { Checkbox } from "./checkbox";
import { COLORS, ColorType } from "@/types/requests";
import { getColor } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { NoteContext } from "@/pages/notes/store/config";
import { ConfigContext } from "@/store/config";

type AcceptedConfigValues = {
  primaryColor: ColorType,
  deleteConfirmation: boolean,
  theme: "system" | "dark" | "light"
}


export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const context = useContext(NoteContext);
  const mainContext = useContext(ConfigContext);
  const { isError, data } = useQuery({
    queryKey: ["root"],
    queryFn: getFiles
  })
  const queryClient = useQueryClient();
  const [config, setConfig] = useState({
    primaryColor: mainContext.primaryColor,
    deleteConfirmation: mainContext.deleteConfirmation,
    theme: mainContext.theme
  } satisfies AcceptedConfigValues);
  if (isError) toast.error("Cannot get root");
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!data) return
      const key = Number(e.key);
      if (e.ctrlKey && !Number.isNaN(key)) {
        e.preventDefault();
        context.setContent({
          path: data[key - 1].name,
          type: data[key - 1].type
        })
      }
    }
    document.addEventListener("keydown", handleKey, true);
    return () => { document.removeEventListener("keydown", handleKey, true); }
  })

  const setConfigKey = <K extends keyof AcceptedConfigValues>(
    key: K,
    value: AcceptedConfigValues[K]
  ) => {
    const newConfig = {...config };
    newConfig[key] = value;
    setConfig(newConfig);
  }

  const applyConfig = async () => {
    await updateConfig({...config });
    queryClient.invalidateQueries({queryKey: ["config"]});
  }

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
                      onClick={() => {
                        context.setContent({
                          type: x.type,
                          path: x.name,
                        });
                        setOpenMobile(false);
                      }}
                    >
                      {x.type === "file" ? <File className="size-5" fill="var(--accent)" strokeWidth={0} /> : <Folder className="size-5" fill="var(--accent)" strokeWidth={0} />}
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
                    : button }
                    </>
                    
                  )
                })}
              </>
          }
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent">
              <Settings />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-y-4">
              <Label>Theme</Label>
              <div>
                <ToggleGroup type="single" defaultValue={config.theme}>
                  <ToggleGroupItem value="system" onClick={() => { setConfigKey("theme", "system") }} variant="outline">
                    <div className={config.theme === "system" ? "text-primary-foreground font-bold" : ""}>system</div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="light" onClick={() => { setConfigKey("theme", "light") }} variant="outline">
                    <div className={config.theme === "light" ? "text-primary-foreground font-bold" : ""}>light</div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark" onClick={() => { setConfigKey("theme", "dark") }} variant="outline">
                    <div className={config.theme === "dark" ? "text-primary-foreground font-bold" : ""}>dark</div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <Label>Color</Label>
              <div className="flex space-x-2">
                {COLORS.map(e => {
                  return <div onClick={() => { setConfigKey("primaryColor", e) }} className="w-5 h-5 rounded-full hover:cursor-pointer" style={{
                    backgroundColor: getColor(e),
                    border: `2px solid #FFFFFF7F`
                  }}></div>
                })
                }
              </div>
              <Label>Delete confirmation</Label>
              <Checkbox onCheckedChange={() => { setConfigKey("deleteConfirmation", !config.deleteConfirmation) }} checked={config.deleteConfirmation} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={async () => { await applyConfig(); setOpen(false); }}>Apply changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  )
}