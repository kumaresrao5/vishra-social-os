import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vishra Social OS",
  description: "AI-powered social media automation for Vishra Holdings."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
