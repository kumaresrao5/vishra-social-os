import { rgb } from "pdf-lib";

export const A4 = {
  w: 595.92,
  h: 842.88,
} as const;

export const COLORS = {
  text: rgb(0.16, 0.16, 0.16),
  muted: rgb(0.45, 0.45, 0.45),
  line: rgb(0.9, 0.9, 0.9),
  headerBg: rgb(0.92, 0.92, 0.92),
  totalBlue: rgb(0.06, 0.45, 0.73), // close to sample
  white: rgb(1, 1, 1),
} as const;

export function yFromTop(top: number): number {
  // Convert a top-origin coordinate to pdf-lib's bottom-origin.
  return A4.h - top;
}

