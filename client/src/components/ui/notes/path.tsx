import { ArrowLeft, Download, Trash2, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewItem } from "./new-item";
import { useContext, useEffect, useRef, useState } from "react";
import { deleteFile, downloadZip } from "@/api/requests";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "react-responsive";
import { ButtonGroup } from "@/components/ui/button-group";
import { handleDownloadBinary } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar-trigger";
import { NoteContext } from "@/pages/notes/store/config";
import { ConfigContext } from "@/store/config";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

type Prop = {
  lock: string | null
  onDownload: (type: "md" | "html") => void
}

export function ItemOptions({ lock, onDownload }: Prop) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const scrollRef = useRef(null as HTMLButtonElement | null);

  const invalidateFolder = () => { queryClient.invalidateQueries({ queryKey: ["folder"] }) }
  const isMobile = useMediaQuery({ maxWidth: 800 });

  const context = useContext(NoteContext);
  const mainContext = useContext(ConfigContext);
  const downloadFolder = async () => {
    const response = await downloadZip(context.content!.path, lock);
    handleDownloadBinary(context.content!.path.split("/").pop() + ".zip", new Blob([response], { type: "application/zip" }))
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [context.content?.path])

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey && !e.altKey && context.currentWindow === "left" || e.ctrlKey && e.altKey && context.currentWindow === "right") && e.key === "ArrowLeft") {
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

  if (context.content === null) return;
  const handleDelete = () => {
    context.setContent(null);
    deleteFile(context.content!.path, lock).then(() => {
      queryClient.invalidateQueries({ queryKey: ["root"] });
    }).catch(() => toast.error("Cannot delete file"));
  }

  const split = context.content.path.split("/");

  split[split.length - 1] = split[split.length - 1].split(".")[0];
  return (
    <div className={"flex justify-between space-y-2" + (!isMobile ? " flex-col" : "")}>
      <div className="flex justify-between w-full">
        <div className="flex items-center h-full p-1 px-2 space-x-2 overflow-auto">
          {context.currentWindow === "left" && (
            isMobile ? <Button size="sm" variant="outline" onClick={() => {
              const newPath = context.content!.path.split("/").slice(0, -1).join("/");
              if (!newPath) {
                context.setContent(null);
                return
              }
              context.setContent({
                path: newPath,
                type: "directory"
              })
            }}>
              <ArrowLeft color="var(--accent)" />
            </Button> : <SidebarTrigger />)}
          {!isMobile && <div className="bg-primary-foreground border-l border-t border-r w-full overflow-auto flex items-center">
            {split.map((e, i) => {
              return (
                <>
                  <Button
                    className="hover:text-accent"
                    size="sm"
                    variant="link"
                    onClick={(i < split.length - 1) ? () => context.setContent({
                      path: split.slice(0, i + 1).join("/"),
                      type: "directory",
                    }) : () => { }}
                  >
                    <h2 className="text-lg">{e}</h2>
                  </Button>
                  {i < split.length - 1 && <h2 className="text-lg">/</h2>}
                  {i == split.length - 1 && 
                  <Tooltip delayDuration={700}>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon-xs" ref={scrollRef} onClick={() => {
                        context.setContent(null);
                      }}><XIcon /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <KbdGroup>
                        <Kbd>{context.currentWindow === "left" ? "CTRL" : "ALT"}</Kbd>
                        <span>+</span>
                        <Kbd>Q</Kbd>
                      </KbdGroup>
                    </TooltipContent>
                  </Tooltip>
                  }
                </>
              );
            })}
          </div>}
        </div>
        <div className="flex items-center space-x-2 justify-end">
          {
            context.content.type === "directory" &&
            <ButtonGroup>
              <NewItem type="file" path={context.content.path + "/"} onChange={invalidateFolder} variant="big" />
              <NewItem type="directory" path={context.content.path + "/"} onChange={invalidateFolder} variant="big" />
            </ButtonGroup>
          }
          {context.content.type === "file" ? <DropdownMenu>
            <DropdownMenuTrigger>
              <Button size="sm" variant="outline" className="text-accent">
                <Download />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDownload("md")}>
                .MD
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload("html")}>
                .HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> :
            <Button size="sm" onClick={downloadFolder} variant="outline" className="text-accent">
              <Download />
            </Button>
          }
          {mainContext.deleteConfirmation ? <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setOpenDeleteDialog(false); }}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog> :
            <Button size="sm" onClick={handleDelete} variant="destructive">
              <Trash2 />
            </Button>
          }
        </div>
      </div>
    </div>
  );
}