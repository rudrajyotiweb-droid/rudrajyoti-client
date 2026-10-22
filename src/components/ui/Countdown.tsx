"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    ms,
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

function useCountdown(iso: string) {
  const base = new Date(iso).getTime();
  // null on the server & first paint to avoid hydration mismatches
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);
  useEffect(() => {
    const target = base;
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [base]);
  return t;
}

const pad = (n: number) => String(n).padStart(2, "0");

function FlipDigit({ value }: { value: string }) {
  return (
    <span className="relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white text-lg font-semibold text-primary shadow-[var(--shadow-soft)] ring-1 ring-border md:h-14 md:w-14 md:text-2xl">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "-100%", opacity: 0, rotateX: 80 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: "100%", opacity: 0, rotateX: -80 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border/70" />
    </span>
  );
}

/** Large flip countdown used on the puja detail page (BRD §6.4.7). */
export function Countdown({ to, className }: { to: string; className?: string }) {
  const t = useCountdown(to);
  if (t && t.ms === 0) {
    return <p className={cn("font-medium text-primary", className)}>Booking Closed</p>;
  }
  const parts: [string, number | undefined][] = [
    ["Days", t?.d],
    ["Hours", t?.h],
    ["Mins", t?.m],
    ["Secs", t?.s],
  ];
  return (
    <div className={cn("flex items-start gap-2 md:gap-3", className)} role="timer" aria-live="off">
      {parts.map(([label, v], i) => (
        <div key={label} className="flex items-start gap-2 md:gap-3">
          <div className="flex flex-col items-center gap-1">
            <FlipDigit value={v === undefined ? "--" : pad(v)} />
            <span className="text-[0.65rem] tracking-wider text-ink-muted uppercase">{label}</span>
          </div>
          {i < 3 && <span className="pt-2.5 text-lg font-semibold text-primary/60 md:pt-3.5">:</span>}
        </div>
      ))}
    </div>
  );
}

/** Compact text countdown for cards: "2d 14h 05m". */
export function MiniCountdown({ to, className }: { to: string; className?: string }) {
  const t = useCountdown(to);
  if (!t) return <span className={cn("tabular-nums", className)}>--</span>;
  if (t.ms === 0) return <span className={className}>Closed</span>;
  return (
    <span className={cn("tabular-nums", className)}>
      {t.d > 0 && `${t.d}d `}
      {pad(t.h)}h {pad(t.m)}m {t.d === 0 && `${pad(t.s)}s`}
    </span>
  );
}

export function useIsClosed(iso: string) {
  const t = useCountdown(iso);
  return t?.ms === 0;
}
