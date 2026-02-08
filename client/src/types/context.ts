import type { ColorType, Config } from "./requests";

export type CurrentContent = {
  type: "file" | "directory",
  path: string,
}


export type MainContext = Omit<Config, "primaryColor"> & {
    primaryColor: ColorType
    mainState: {
        setContent: (c: CurrentContent | null) => void,
        content: CurrentContent | null
    }
}