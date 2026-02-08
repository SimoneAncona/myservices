// import { BrowserRouter, Route, Routes } from "react-router-dom"
import Notes from "@/pages/notes/Notes"
// import Home from "@/pages/home/Home"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { getConfig, getVersion, init } from "@/api/requests";
import { getColor } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { ConfigContext } from "./store/config";
import { toast } from "sonner";
import { Skeleton } from "./components/ui/skeleton";

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
      if (version !== 0)
        throw new Error("version");
      return res;
    }
  });
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current || !data) return;
    if ("auth" in data) {
      if (!data.auth)
        setTimeout(() => toast.warning("Authentication is not set!"), 3000);
      hasRun.current = true;
    }
  }, [data])

  if (isError)
    return (
      <div className="flex items-center justify-center h-40">
        <Alert variant={"destructive"} className="w-100">
          <AlertCircle />
          <AlertTitle>{error.message !== "version" ? "Cannot connect to server" : "Verion mismatch"}</AlertTitle>
          <AlertDescription>{error.message !== "version" ? "Check that the server service is running" : "This client supports only 0.x APIs"}</AlertDescription>
        </Alert>
      </div>
    );

  if (data && "login" in data) {
    return (
      <div className="flex items-center justify-center h-dvh">
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
    data ?
      <ConfigContext.Provider value={data}>
        <Notes/>
        {/* <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </BrowserRouter> */}
      </ConfigContext.Provider>
    :
    <div>
      <Skeleton></Skeleton>
    </div>
  )
}

export default App