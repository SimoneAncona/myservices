import { HardDrive, HomeIcon, NotebookIcon } from "lucide-react"
import { Button } from "../button"
import { Link } from "react-router-dom"

type Props = {
  shortcuts: ("notes" | "files")[]
}

const ICONS = {
  "notes": <NotebookIcon />,
  "files": <HardDrive />
}

export function HomePanel({ shortcuts }: Props) {
  return (
    <div className="shrink-0 h-100dvh bg-primary-foreground w-14 border-l border-l-sidebar-accent flex flex-col items-center pt-10 space-y-5">
      <Link to=".."><Button variant="outline"><HomeIcon /></Button></Link>
      {shortcuts.map(e => {
        return <Link to={"../" + e}><Button variant="outline">{ICONS[e]}</Button></Link>
      })}
    </div>
  )
}