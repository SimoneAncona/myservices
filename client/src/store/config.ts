import { createContext } from "react";
import { getColor } from "@/lib/utils";
import { Config } from "@/types/requests";

export const ConfigContext = createContext({
  primaryColor: getColor("red"),
  theme: "light",
  auth: false,
  deleteConfirmation: false
} as Config);