import { AppSidebar } from "@/components/ui/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useContext, useEffect, useState } from "react"
import { ConfigContext } from "@/store/config";
import { FileEditor } from "@/pages/notes/FileEditor";
import { FolderViewer } from "@/pages/notes/FolderViewer";
import { AiCard } from "@/components/ui/ai-card";
import { SidebarTrigger } from "@/components/ui/sidebar-trigger";
import { NoteContext } from "./store/config";
import { CurrentContent, NoteContextType } from "./types/context";


function Notes() {
  const [content, setContent] = useState(null as CurrentContent | null);
  const mainContext = useContext(ConfigContext);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "q") {
        e.preventDefault();
        setContent(null);
      }
    }
    document.addEventListener("keydown", handler, true)
    return () => { document.removeEventListener("keydown", handler, true) }
  })

  const context: NoteContextType = {
    content: content,
    setContent: setContent
  }

  return (
      <SidebarProvider>
        <NoteContext.Provider value={context}>
          <AppSidebar />
          <main className="p-3 w-full flex flex-col h-dvh overflow-hidden">
            <Toaster />
            { !content && <div><SidebarTrigger/></div> }
            { mainContext.askai && <AiCard /> }
            {
              content === null ?
                <div className="flex items-center justify-center h-dvh">
                  <h1 className="font-bold text-4xl opacity-25">Workspace empty</h1>
                </div>
                :
                content.type === "file" ? <FileEditor /> : <FolderViewer />
            }
          </main>
        </NoteContext.Provider>
      </SidebarProvider>
  )
}

export default Notes