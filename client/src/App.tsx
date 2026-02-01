import { AppSidebar } from "@/components/ui/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useState } from "react"
import type { Config } from "./models/requests";
import { getConfig, getVersion, init } from "./api/requests";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Skeleton } from "./components/ui/skeleton";
import { toast } from "sonner";
import { ConfigContext } from "./ctx/config";
import { FileEditor } from "./FileEditor";
import { FolderViewer } from "./FolderViewer";
import { useTheme } from "@/components/theme-provider"
import { getColor } from "./lib/utils";
import axios from "axios";

export type ShowObject = {
  type: "file" | "directory",
  path: string,
  isLocked: boolean
}

function setAccentColor(color: string) {
  const root = document.documentElement;
  root.style.setProperty('--accent', color);
}


function App() {
  const [data, setData] = useState(null as Config | {login: boolean} | null);
  const [error, setError] = useState(null as "server" | "version" | null);
  const [content, setContent] = useState(null as ShowObject | null);
  const { setTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getConfig();
        const version = await getVersion();
        await init();
        setData(res);
        if (version !== 1)
          setError("version")
        if (res !== null && "auth" in res) {
          setTheme(res.theme);
          setAccentColor(getColor(res.primaryColor));
          if (!res.auth)
            setTimeout(() => toast.warning("Authentication is not set!"), 3000);
        }
      } catch {
        setError("server");
      }
    }
    fetchData();
  }, [setTheme]);

  if (error)
    return (
      <div className="flex items-center justify-center h-40">
        <Alert variant={"destructive"} className="w-100">
          <AlertCircle />
          <AlertTitle>{error === "server" ? "Cannot connect to server" : "Verion mismatch"}</AlertTitle>
          <AlertDescription>{error === "server" ? "Check that the server service is running" : "This client supports only 1.x APIs"}</AlertDescription>
        </Alert>
      </div>
    );

  if (data !== null && "login" in data && data.login)
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-100">
          <CardHeader>
            <CardTitle>Autentication required</CardTitle>
            <CardDescription>Enter the server token</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-y-2 flex-col">
              <Label>Token</Label>
              <Input type="password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Login</Button>
          </CardFooter>
        </Card>
      </div>
    )

  return (
        data !== null && "auth" in data ?
          <SidebarProvider>
            <ConfigContext value={data}>
              <AppSidebar setShow={setContent} />
              <main className="p-3 w-full flex flex-col h-screen overflow-hidden">
                <SidebarTrigger />
                <Toaster />
                {
                  content === null ?
                  <div className="flex items-center justify-center h-screen">
                    <h1 className="font-bold text-4xl opacity-25">Workspace empty</h1>
                  </div> 
                  :
                  content.type === "file" ? <FileEditor path={content.path} isLocked={content.isLocked} setContent={setContent} /> : <FolderViewer path={content.path} isLocked={content.isLocked} setShow={setContent}/>
                }
              </main>
            </ConfigContext>
          </SidebarProvider>
        :
          <div className="h-screen flex">
            <Skeleton className="w-100" />
            <div className="space-y-5 w-full p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6" />
              ))}
            </div>
          </div>
  )
}
 
export default App