"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/home";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="max-w-md mx-auto flex">
        <Link
          href="/"
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
            isHome
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">主頁</span>
        </Link>
        <Link
          href="/history"
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
            !isHome
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-5 w-5" />
          <span className="text-xs">歷史</span>
        </Link>
      </div>
    </nav>
  );
}
