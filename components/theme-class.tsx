"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Splits styling between the marketing site (/marketing, served on www.*)
// and the internal app (everything else, served on ai.*).
export default function ThemeClass() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    const html = document.documentElement;
    const isMarketing = pathname === "/marketing" || pathname.startsWith("/marketing/");

    html.classList.toggle("theme-app", !isMarketing);
    html.classList.toggle("theme-marketing", isMarketing);
  }, [pathname]);

  return null;
}

