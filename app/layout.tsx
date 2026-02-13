import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeClass from "@/components/theme-class";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Flext Social OS",
  description: "AI-assisted social publishing control center for multi-outlet teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${fraunces.variable} font-sans`}>
        <ThemeClass />
        {children}
      </body>
    </html>
  );
}
