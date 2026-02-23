"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Home, CalendarDays } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const PUBLIC_PATHS = ["/login"];

const navPaths = [
  { href: "/", label: "主頁", icon: Home, paths: ["/", "/home"] },
  { href: "/history", label: "歷史", icon: CalendarDays, paths: ["/history"] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicPath) {
      router.push("/login");
    }
  }, [user, loading, isPublicPath, router]);

  // 載入中顯示 loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-6" />
      </div>
    );
  }

  // 未登入且不是公開頁面，不渲染內容
  if (!user && !isPublicPath) {
    return null;
  }

  // 公開頁面（登入頁）或未登入，不顯示導航列
  if (isPublicPath || !user) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-dvh">
      {/* Top Bar */}
      <header className="shrink-0 z-10 bg-background border-b">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "使用者"} />
              <AvatarFallback className="text-xs">
                {(user.displayName || user.email || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-xl font-semibold text-center ">Cycle</h1>
          <Button variant="secondary" size="icon" onClick={signOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-background max-w-md mx-auto w-full p-4">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="shrink-0 bg-background border-t">
        <div className="max-w-md mx-auto flex">
          {navPaths.map(({ href, label, icon: Icon, paths }) => (
            <Link
              key={href}
              href={href}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                paths.includes(pathname)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
