import type { Config } from "./requests";

export type CurrentContent = {
  type: "file" | "directory",
  path: string,
}


export type MainContext = Omit<Config, "primaryColor"> & {
    primaryColor: string
    mainState: {
        setContent: (c: CurrentContent | null) => void,
        content: CurrentContent | null
    }
}