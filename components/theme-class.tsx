"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Splits styling between the marketing site (/marketing, served on www.*)
// and the internal app (everything else, served on ai.*).
export default function ThemeClass() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    const html = document.documentElement;
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isMarketingPath = pathname === "/marketing" || pathname.startsWith("/marketing/");
    const isAppHost = host.startsWith("ai.");
    const isMarketingHost = host.startsWith("www.") || host === "scalex.my";

    // Rules:
    // - Local dev uses /marketing/*, so prefer path-based detection.
    // - Production uses host-based routing: ai.* for app and www.* for marketing.
    // - Default to app for localhost and unknown hosts.
    const isMarketing = isMarketingPath || (!isAppHost && isMarketingHost);

    html.classList.toggle("theme-app", !isMarketing);
    html.classList.toggle("theme-marketing", isMarketing);
  }, [pathname]);

  return null;
}
