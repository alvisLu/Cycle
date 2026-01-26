"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || "使用者"}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium truncate max-w-[150px]">
              {user.displayName || user.email}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" />
            登出
          </Button>
        </div>
      </header>

      {children}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="max-w-md mx-auto flex">
          {navPaths.map(({ href, label, icon: Icon, paths }) => (
            <Link
              key={href}
              href={href}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${paths.includes(pathname)
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
    </>
  );
}
