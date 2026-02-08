import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { NewItem } from "./new-item";
import { useContext, useState } from "react";
import { ConfigContext } from "@/store/config";
import { deleteFile, downloadZip } from "@/api/requests";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { useMediaQuery } from "react-responsive";
import { ButtonGroup } from "./button-group";
import { handleDownloadBinary } from "@/lib/utils";
import { SidebarTrigger } from "./sidebar-trigger";

type Prop = {
  lock: string | null
  onDownload: (type: "md" | "html") => void
}

export function ItemOptions({ lock, onDownload }: Prop) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const invalidateFolder = () => { queryClient.invalidateQueries({ queryKey: ["folder"] }) }
  const isMobile = useMediaQuery({ maxWidth: 800 });

  const downloadFolder = async () => {
    const response = await downloadZip(context.mainState.content!.path, lock);
    handleDownloadBinary(context.mainState.content!.path.split("/").pop() + ".zip", new Blob([response], { type: "application/zip" }))
  }

  const context = useContext(ConfigContext);
  if (context.mainState.content === null) return;
  const split = context.mainState.content.path.split("/");
  split[split.length - 1] = split[split.length - 1].split(".")[0];
  return (
    <div className={"flex justify-between space-y-2" + (!isMobile ? " flex-col" : "")}>
      <div className="space-x-2">
        <SidebarTrigger />
        {isMobile && <Button variant="outline" onClick={() => {
          const newPath = context.mainState.content!.path.split("/").slice(0, -1).join("/");
          if (!newPath) {
            context.mainState.setContent(null);
            return
          }
          context.mainState.setContent({
            path: newPath,
            type: "directory"
          })
        }}>
          <ArrowLeft color="var(--accent)" />
        </Button>}
      </div>
      <div className="flex justify-between">
        {!isMobile && <div className={"flex items-center overflow-auto"}>
          {
            split.map((e, i) => {
              return (
                <>
                  <Button
                    className="hover:text-accent"
                    size="lg"
                    variant="link"
                    onClick={(i < split.length - 1) ? () => context.mainState.setContent({
                      path: split.slice(0, i + 1).join("/"),
                      type: "directory",
                    }) : () => { }}
                  >
                    <h2 className="text-2xl">{e}</h2>
                  </Button>
                  {i < split.length - 1 && <h2 className="text-2xl">/</h2>}
                </>
              );
            })
          }
        </div>}
        <div className="flex items-center space-x-2 justify-end">
          {
            context.mainState.content.type === "directory" &&
            <ButtonGroup>
              <NewItem type="file" path={context.mainState.content.path + "/"} onChange={invalidateFolder} variant="big" />
              <NewItem type="directory" path={context.mainState.content.path + "/"} onChange={invalidateFolder} variant="big" />
            </ButtonGroup>
          }
          {context.mainState.content.type === "file" ? <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="text-accent">
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
            <Button onClick={downloadFolder} variant="outline" className="text-accent">
              <Download />
            </Button>
          }
          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setOpenDeleteDialog(false); }}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                  context.mainState.setContent(null);
                  deleteFile(context.mainState.content!.path, lock).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["root"] });
                  }).catch(() => toast.error("Cannot delete file"));
                }}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}