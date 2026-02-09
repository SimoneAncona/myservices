import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { NoteContext } from "@/pages/notes/store/config"
import { ReactNode, useContext } from "react"

type Props = {
  children: ReactNode,
  path: string,
  type: "file" | "directory"
}

export function FileContext({ children, path, type }: Props) {
  const context = useContext(NoteContext);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Rename
        </ContextMenuItem>
        <ContextMenuItem variant="destructive">
          Delete
        </ContextMenuItem>
        <hr />
        <ContextMenuItem onClick={() => context.setOtherContent({
          path: path,
          type: type
        })}>
          Snap {context.currentWindow === "left" ? "right" : "left"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}