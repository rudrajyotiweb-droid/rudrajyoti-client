"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUi } from "@/store";

/** A− / A+ control for elderly users (BRD §6.1). */
export function FontSizeControl({ dark = false }: { dark?: boolean }) {
  const { fontScale, setFontScale } = useUi();

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
  }, [fontScale]);

  const cls = cn(
    "grid h-6 min-w-7 place-items-center rounded-md px-1 text-[0.7rem] font-semibold transition",
    dark ? "border border-border bg-white text-ink hover:border-primary hover:text-primary" : "hover:bg-white/15",
  );
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Text size">
      <button className={cls} onClick={() => setFontScale(fontScale - 0.05)} aria-label="Decrease text size">
        A−
      </button>
      <button className={cls} onClick={() => setFontScale(1)} aria-label="Reset text size">
        A
      </button>
      <button className={cls} onClick={() => setFontScale(fontScale + 0.05)} aria-label="Increase text size">
        A+
      </button>
    </div>
  );
}
