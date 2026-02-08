import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ColorType } from "../types/requests";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COLOR_MAP = {
  "neutral": "var(--primary)",
  "red": "#ff4f42",
  "green": "#57d957",
  "blue": "#3b45f7",
  "yellow": "#f7ff61",
  "cyan": "#4de7f0",
  "magenta": "#e65cf2"
}

export function getColor(color: ColorType) {
  return COLOR_MAP[color];
}

export function handleDownload(fileName: string, content: string) {
  const element = document.createElement('a');
  const file = new Blob([content], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = fileName;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export function handleDownloadBinary(fileName: string, content: Blob) {
  const element = document.createElement('a');
  element.href = URL.createObjectURL(content);
  element.download = fileName;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}