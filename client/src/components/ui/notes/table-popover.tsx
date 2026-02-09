import { Editor } from "@tiptap/react"
import { ReactNode, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Props = {
  editor: Editor,
  children: ReactNode
}

export function TableCreator({ editor, children }: Props) {
  const [hover, setHover] = useState(null as { x: number, y: number } | null);

  return (
    <Popover>
      <PopoverTrigger onMouseDown={e => e.preventDefault()} asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        onOpenAutoFocus={(e) => e.preventDefault()} 
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="flex w-35 h-35 p-2 items-center justify-center">
        <div className="grid grid-cols-6 grid-rows-6 gap-1.5">
          {
            Array.from({ length: 6 * 6 }).map((_, i) => {
              const cords = { x: Math.floor(i % 6), y: i / 6 };
              const selected = hover && hover.x >= cords.x && hover.y >= cords.y
              return (
                <div 
                  onMouseOver={() => setHover(cords)} 
                  className={"hover:cursor-pointer h-3.5 w-3.5 border rounded-xs" + (selected ? " bg-accent" : "")}
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: cords.y + 1, cols: cords.x + 1, withHeaderRow: false }).run()
                  }}
                ></div>
              )
            })
          }
        </div>
      </PopoverContent>
    </Popover>
  )
}