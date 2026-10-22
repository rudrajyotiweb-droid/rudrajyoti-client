"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TempleCard } from "@/components/cards/TempleCard";
import type { Temple } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TempleDirectory({ temples }: { temples: Temple[] }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");
  const [deity, setDeity] = useState("All");
  const states = ["All", ...new Set(temples.map((t) => t.state))];
  const deities = ["All", ...new Set(temples.map((t) => t.deity))];

  const list = useMemo(
    () => temples.filter((t) => (state === "All" || t.state === state) && (deity === "All" || t.deity === deity) && (t.name + t.city).toLowerCase().includes(q.toLowerCase())),
    [temples, q, state, deity],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <div className="flex flex-wrap gap-3">
        <label className="flex h-12 min-w-[14rem] flex-1 items-center gap-2 rounded-full border border-border bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-primary">
          <Search className="h-4 w-4 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search temple or city" className="h-full flex-1 bg-transparent text-sm outline-none" />
        </label>
        <select value={state} onChange={(e) => setState(e.target.value)} aria-label="State" className="h-12 rounded-full border border-border bg-white px-4 text-sm">
          {states.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
        {deities.map((d) => (
          <button key={d} onClick={() => setDeity(d)} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm transition", deity === d ? "border-primary bg-primary text-white" : "border-border bg-white")}>
            {d}
          </button>
        ))}
      </div>
      <motion.div layout className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((t) => (
            <motion.div key={t.slug} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <TempleCard temple={t} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
