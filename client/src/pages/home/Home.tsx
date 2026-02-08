import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HardDrive, NotebookIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
    const paths = ["notes", "files"];

    return (
        <div className="fixed w-full h-full flex items-center justify-center space-x-10">
            {paths.map(e => {
                return (
                    <Tooltip delayDuration={700}>
                        <TooltipTrigger>
                            <Link to={e}>
                                <div className="shadow-xl size-30 bg-primary-foreground hover:bg-accent transition-all border-2 border-accent flex justify-center items-center rounded-2xl">
                                    {e === "notes" ? <NotebookIcon size={40}/> :
                                    e === "files" ? <HardDrive size={40} /> : <></>
                                    }
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            {e[0].toUpperCase() + e.slice(1)}
                        </TooltipContent>
                    </Tooltip>
                )
            })}
        </div>
    )
}