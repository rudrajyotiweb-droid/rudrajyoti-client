"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Stars({ value, className, size = 14 }: { value: number; className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(value) ? "fill-accent text-accent" : "fill-sand text-sand"}
        />
      ))}
    </span>
  );
}

export function QtyStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const btn = cn(
    "grid place-items-center rounded-full text-primary transition hover:bg-primary-soft active:scale-90 disabled:opacity-30",
    size === "sm" ? "h-7 w-7" : "h-9 w-9",
  );
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-white p-0.5">
      <button type="button" aria-label="Decrease" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn("min-w-6 text-center font-semibold tabular-nums", size === "sm" && "text-sm")}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={value} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button type="button" aria-label="Increase" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Accordion({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium transition-colors hover:bg-bg-alt"
              aria-expanded={isOpen}
            >
              <span className={cn("transition-colors", isOpen && "text-primary")}>{it.q}</span>
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary transition-transform duration-300",
                  isOpen && "rotate-180 bg-primary text-white",
                )}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-muted">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function Badge({ children, className, tone = "red" }: { children: React.ReactNode; className?: string; tone?: "red" | "gold" | "green" | "white" }) {
  const tones = {
    red: "bg-primary text-white",
    gold: "bg-accent text-white",
    green: "bg-success/10 text-success",
    white: "bg-white/90 text-primary backdrop-blur",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "h-12 w-full rounded-xl border border-border bg-white px-4 text-[0.95rem] outline-none transition placeholder:text-ink-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/10";
