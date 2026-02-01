export type FolderItem = {
    name: string,
    type: "directory" | "file",
    isLocked: boolean
}

export type Config = {
    primaryColor: "neutral" | "red",
    theme: "dark" | "light",
    deleteConfirmation: boolean
    auth: boolean
}