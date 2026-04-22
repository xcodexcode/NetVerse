import Link from "next/link";
import { Orbit } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-glow">
        <Orbit className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
          NetVerse
        </span>
        <span className="block text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Network Lab OS
        </span>
      </span>
    </Link>
  );
}
