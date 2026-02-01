import { createContext } from "react";
import type { Config } from "../models/requests";

export const ConfigContext = createContext({
  primaryColor: "red",
  theme: "light",
  auth: false,
  deleteConfirmation: false
} as Config);