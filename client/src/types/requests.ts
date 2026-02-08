export const COLORS = [
    "neutral", 
    "red", 
    "green",
    "blue",
    "yellow",
    "cyan",
    "magenta"
] as const;

export type ColorType = typeof COLORS[number];

export type FolderItem = {
    name: string,
    type: "directory" | "file",
    isLocked: boolean
}

export type Config = {
    primaryColor: ColorType
    theme: "dark" | "light" | "system",
    deleteConfirmation: boolean
    auth: boolean,
    standalone: boolean,
    askai: boolean
}

export type UpdateConfig = Omit<Config, "auth" | "askai">