import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeClass from "@/components/theme-class";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Quotiva - Invoice and Quote Generator",
  description: "Template-locked invoice and quotation PDF generator.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans`}>
        <ThemeClass />
        {children}
      </body>
    </html>
  );
}
