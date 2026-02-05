import { createContext } from "react";
import { getColor } from "@/lib/utils";
import type { MainContext } from "@/types/context";

export const ConfigContext = createContext({
  primaryColor: getColor("red"),
  theme: "light",
  auth: false,
  deleteConfirmation: false
} as MainContext);