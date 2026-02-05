import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Config } from "../types/requests";
import type { getConfig } from "../api/requests";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Colors = Config["primaryColor"];

const COLOR_MAP = {
  "red": "#ff4f42",
  "neutral": "var(--primary)"
}

export function getColor(color: Colors) {
  return COLOR_MAP[color];
}