import { createContext } from "react";
import { NoteContextType } from "../types/context";

export const NoteContext = createContext({
  content: null,
  setContent: () => {},
  setOtherContent: () => {},
  currentWindow: "left"
} as NoteContextType);