import { AppSidebar } from "@/components/ui/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useState } from "react"
import { getConfig, getVersion, init } from "./api/requests";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Skeleton } from "./components/ui/skeleton";
import { toast } from "sonner";
import { ConfigContext } from "./store/config";
import { FileEditor } from "./FileEditor";
import { FolderViewer } from "./FolderViewer";
import { useTheme } from "@/components/theme-provider"
import { getColor } from "./lib/utils";
import type { CurrentContent, MainContext } from "./types/context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function setAccentColor(color: string) {
  const root = document.documentElement;
  root.style.setProperty('--accent', color);
}

function App() {
  const { setTheme } = useTheme();
  const [password, setPassword] = useState(null as string | null);
  const { isError, error, data, } = useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      if (password !== null) toast.error("Wrong token");
      const res = await getConfig();
      if ("login" in res) return res;
      const version = await getVersion();
      await init();
      if ("theme" in res)
        setTheme(res.theme);
      if ("primaryColor" in res)
        setAccentColor(getColor(res.primaryColor));
      if (version !== 1)
        throw "version";
      if (res !== null && "auth" in res) {
        if (!res.auth)
          setTimeout(() => toast.warning("Authentication is not set!"), 3000);
      }
      return res;
    }
  });
  const [content, setContent] = useState(null as CurrentContent | null);
  const queryClient = useQueryClient();

  let context: MainContext = {
    primaryColor: getColor("red"),
    theme: "light",
    auth: false,
    deleteConfirmation: false,
    mainState: {
      setContent: setContent,
      content: content
    }
  }

  if (data && "auth" in data) {
    context = {
      ...data,
      mainState: {
        setContent: setContent,
        content: content
      },
      primaryColor: getColor(data.primaryColor)
    } satisfies MainContext;
  }

  if (isError)
    return (
      <div className="flex items-center justify-center h-40">
        <Alert variant={"destructive"} className="w-100">
          <AlertCircle />
          <AlertTitle>{error.message !== "version" ? "Cannot connect to server" : "Verion mismatch"}</AlertTitle>
          <AlertDescription>{error.message !== "version" ? "Check that the server service is running" : "This client supports only 1.x APIs"}</AlertDescription>
        </Alert>
      </div>
    );

  if (data && "login" in data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Toaster />
        <Card className="w-100">
          <CardHeader>
            <CardTitle>Autentication required</CardTitle>
            <CardDescription>Enter the server token</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-y-2 flex-col">
              <Label>Token</Label>
              <Input onKeyDown={e => {
                if (e.key === "Enter") {
                  localStorage.setItem("token", password ?? "");
                  queryClient.invalidateQueries({queryKey: ["config"]})
                }
              }} onChange={e => setPassword(e.target.value)} type="password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => {
              localStorage.setItem("token", password ?? "");
              queryClient.invalidateQueries({queryKey: ["config"]})
            }}>Login</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }


  return (
    data && "auth" in data ?
      <SidebarProvider>
        <ConfigContext.Provider value={context}>
          <AppSidebar />
          <main className="p-3 w-full flex flex-col h-screen overflow-hidden">
            <SidebarTrigger />
            <Toaster />
            {
              content === null ?
                <div className="flex items-center justify-center h-screen">
                  <h1 className="font-bold text-4xl opacity-25">Workspace empty</h1>
                </div>
                :
                content.type === "file" ? <FileEditor /> : <FolderViewer />
            }
          </main>
        </ConfigContext.Provider>
      </SidebarProvider>

      :
      <div className="h-screen flex">
        <Skeleton className="w-100" />
        <div className="space-y-5 w-full p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton lock={i} className="h-6" />
          ))}
        </div>
      </div>
  )
}

export default App