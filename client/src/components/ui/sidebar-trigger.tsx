import { PanelLeft } from "lucide-react";
import { Button } from "./button";
import { useSidebar } from "./sidebar";

export function SidebarTrigger() {
    const { open, openMobile, setOpen, setOpenMobile } = useSidebar();
    return (
        <Button onClick={() => {setOpen(!open); setOpenMobile(!openMobile)}} variant="outline">
            <PanelLeft />
        </Button>
    )
}