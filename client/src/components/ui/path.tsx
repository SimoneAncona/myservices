import { Download, Trash2 } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { NewItem } from "./new-item";
import { useContext, useState } from "react";
import { ConfigContext } from "@/store/config";
import { deleteFile } from "@/api/requests";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";

type Prop = {
  lock: string | null
  onDownload: (type: "md" | "html") => void
}

export function ItemOptions({ lock, onDownload }: Prop) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const invalidateFolder = () => { queryClient.invalidateQueries({ queryKey: ["folder"] }) }

  const context = useContext(ConfigContext);
  if (context.mainState.content === null) return;
  const split = context.mainState.content.path.split("/");
  split[split.length - 1] = split[split.length - 1].split(".")[0];
  return (
    <div className="flex justify-between">
      <div className="flex items-center w-4/5 overflow-auto">
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
      </div>
      <div className="flex items-center space-x-2">
        {
          context.mainState.content.type === "directory" ?
            <>
              <NewItem type="file" path={context.mainState.content.path + "/"} onChange={invalidateFolder} variant="big" />
              <NewItem type="directory" path={context.mainState.content.path + "/"} onChange={invalidateFolder} variant="big" />
            </>
            :
            <></>
        }
        <DropdownMenu>
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
        </DropdownMenu>
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
  );
}