"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BrainCircuit,
  FolderKanban,
  Gauge,
  Orbit,
  PanelLeft,
  Sparkles
} from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/academy", label: "Academy", icon: BrainCircuit },
  { href: "/simulator", label: "Simulator", icon: Orbit },
  { href: "/labs", label: "Labs", icon: BookOpen },
  { href: "/projects", label: "Project Library", icon: FolderKanban }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950/70 px-5 py-6 backdrop-blur-xl lg:flex">
      <BrandMark className="mb-10" />

      <div className="mb-8 rounded-3xl border border-primary/15 bg-primary/10 p-4">
        <Badge variant="info" className="mb-3 w-fit">
          Live workspace
        </Badge>
        <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-foreground">
          Your network command center
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Train subnetting, AWS, Linux, packets, security, and interviews from one shared workspace.
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Daily drill
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Run one subnet drill, one Linux command, and one AWS flashcard before you call the session done.
        </p>
        <Button asChild variant="secondary" className="mt-4 w-full justify-between">
          <Link href="/academy">
            Open Academy
            <PanelLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </aside>
  );
}
