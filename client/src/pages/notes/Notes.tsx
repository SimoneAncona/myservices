import { AppSidebar } from "@/components/ui/notes/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useContext, useEffect, useState } from "react"
import { ConfigContext } from "@/store/config";
import { FileEditor } from "@/pages/notes/FileEditor";
import { FolderViewer } from "@/pages/notes/FolderViewer";
import { AiCard } from "@/components/ui/common/ai-card";
import { SidebarTrigger } from "@/components/ui/sidebar-trigger";
import { NoteContext } from "@/pages/notes/store/config";
import { CurrentContent, NoteContextType } from "@/pages/notes/types/context";
import { HomePanel } from "@/components/ui/common/home-panel";


function Notes() {
  const [content, setContent] = useState([null, null] as [CurrentContent | null, CurrentContent | null]);
  const mainContext = useContext(ConfigContext);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "q") {
        e.preventDefault();
        setContent([content[1], null]);
      }
      if (e.altKey && e.key === "q") {
        e.preventDefault();
        setContent([content[0], null]);
      }
    }
    document.addEventListener("keydown", handler, true)
    return () => { document.removeEventListener("keydown", handler, true) }
  })

  const setLeft = (c: CurrentContent | null) => { setContent([c, content[1]]) };
  const setRight = (c: CurrentContent | null) => { setContent([content[0], c]) };

  const contextLeft: NoteContextType = {
    content: content[0],
    setContent: setLeft,
    setOtherContent: setRight,
    currentWindow: "left"
  }

  const contextRight: NoteContextType = {
    content: content[1],
    setContent: setRight,
    setOtherContent: setLeft,
    currentWindow: "right"
  }

  return (
      <SidebarProvider>
        <NoteContext.Provider value={contextLeft}>
          <AppSidebar />
          <Toaster />
          <main className="p-3 w-full flex flex-col h-dvh overflow-hidden">
            { !content[0] && <div><SidebarTrigger/></div> }
            { mainContext.askai && <AiCard /> }
            {
              content[0] === null ?
                <div className="flex items-center justify-center h-dvh">
                  <h1 className="font-bold text-4xl opacity-25">Workspace empty</h1>
                </div>
                :
                content[0].type === "file" ? <FileEditor /> : <FolderViewer />
            }
          </main>
          
        </NoteContext.Provider>
        {content[1] && 
        <NoteContext.Provider value={contextRight}>
          <main className="p-3 w-full flex flex-col h-dvh overflow-hidden border-l-2">
            {content[1].type === "file" ? <FileEditor /> : <FolderViewer />}
          </main>
        </NoteContext.Provider>}
        <HomePanel shortcuts={["files"]} />
      </SidebarProvider>
  )
}

export default Notes