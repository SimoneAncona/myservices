export type CurrentContent = {
  type: "file" | "directory",
  path: string,
}

export type NoteContextType = {
  content: CurrentContent | null,
  setContent: (e: CurrentContent | null) => void
  setOtherContent: (e: CurrentContent | null) => void
  currentWindow: "right" | "left"
}