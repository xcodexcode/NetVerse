"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, type PropsWithChildren } from "react";
import { LogOut, Sparkles } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");
}

export function AppShell({ children }: PropsWithChildren) {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { user, signOut, isDemoMode } = useAuth();
  const router = useRouter();

  const avatarFallback = useMemo(() => initials(user?.displayName ?? "NV"), [user?.displayName]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-sm text-muted-foreground shadow-panel">
          Loading secure workspace...
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/65 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Network Engineering Workspace
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
                Welcome back, {user.displayName}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isDemoMode ? "warning" : "success"}>
                {isDemoMode ? "Demo Auth" : "Firebase Auth"}
              </Badge>
              <Button asChild variant="secondary" size="sm">
                <Link href="/simulator">
                  <Sparkles className="h-4 w-4" />
                  Analyze network
                </Link>
              </Button>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Avatar>
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-foreground">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
