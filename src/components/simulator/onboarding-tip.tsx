"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { readLocalStorage, writeLocalStorage } from "@/lib/utils/local-storage";

const ONBOARDING_KEY = "netverse.onboarding.simulator";

export function OnboardingTip() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = readLocalStorage<boolean>(ONBOARDING_KEY, false);
    setOpen(!seen);
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div className="absolute right-6 top-6 z-20 max-w-sm rounded-3xl border border-primary/20 bg-slate-950/92 p-5 shadow-panel backdrop-blur-xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary/80">Quick start</p>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-semibold text-foreground">
            Build your first lab in seconds
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            writeLocalStorage(ONBOARDING_KEY, true);
            setOpen(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>1. Drag devices from the palette into the canvas.</p>
        <p>2. Connect them using the handles on each node.</p>
        <p>3. Edit configs in the inspector, then run a ping in the console.</p>
      </div>
    </div>
  );
}
