"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PujaCard } from "@/components/cards/PujaCard";
import { deityImages, deities, purposes } from "@/data/taxonomy";
import type { PujaCardT, TempleCardT } from "@/lib/types";
import { cn } from "@/lib/utils";

type Sort = "soonest" | "popular" | "price-asc" | "price-desc";

export function PujaListing({ pujas, temples }: { pujas: PujaCardT[]; temples: TempleCardT[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const initialDeity = sp.get("deity") ?? undefined;
  const initialPurpose = sp.get("purpose") ?? undefined;
  const initialQuery = sp.get("q") ?? undefined;
  const [deity, setDeity] = useState(initialDeity ?? "All");
  const [purpose, setPurpose] = useState(initialPurpose ?? "");
  const [temple, setTemple] = useState("");
  const [q, setQ] = useState(initialQuery ?? "");
  const [sort, setSort] = useState<Sort>("soonest");
  const [sheet, setSheet] = useState(false);

  // keep filters in the URL so results are shareable (BRD Phase 2 §2)
  useEffect(() => {
    const p = new URLSearchParams();
    if (deity !== "All") p.set("deity", deity);
    if (purpose) p.set("purpose", purpose);
    if (q) p.set("q", q);
    router.replace(`/puja/${p.size ? `?${p}` : ""}`, { scroll: false });
  }, [deity, purpose, q, router]);

  const list = useMemo(() => {
    const s = q.toLowerCase();
    const out = pujas.filter(
      (p) =>
        (deity === "All" || p.deity === deity) &&
        (!purpose || p.purposes.includes(purpose)) &&
        (!temple || p.templeSlug === temple) &&
        (!s || (p.title + p.subtitle + p.deity).toLowerCase().includes(s)),
    );
    return out.sort((a, b) => {
      if (sort === "popular") return b.devotees - a.devotees;
      if (sort === "price-asc") return a.startingPrice - b.startingPrice;
      if (sort === "price-desc") return b.startingPrice - a.startingPrice;
      return +new Date(a.cutoff) - +new Date(b.cutoff);
    });
  }, [pujas, deity, purpose, temple, q, sort]);

  const activeCount = (purpose ? 1 : 0) + (temple ? 1 : 0);

  const filters = (
    <div className="space-y-6">
      <div>
        <p className="mb-2.5 text-sm font-semibold">Purpose</p>
        <div className="flex flex-wrap gap-2">
          {purposes.map((p) => (
            <button
              key={p}
              onClick={() => setPurpose(purpose === p ? "" : p)}
              className={cn("rounded-full border px-3.5 py-1.5 text-sm transition", purpose === p ? "border-primary bg-primary text-white" : "border-border bg-white hover:border-primary")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2.5 text-sm font-semibold">Temple</p>
        <div className="space-y-1">
          {temples.map((t) => (
            <label key={t.slug} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-bg">
              <input type="radio" name="temple" checked={temple === t.slug} onChange={() => setTemple(t.slug)} className="accent-primary" />
              <span className="flex-1">{t.name}</span>
              <span className="text-xs text-ink-muted">{t.city}</span>
            </label>
          ))}
        </div>
      </div>
      {activeCount > 0 && (
        <button
          onClick={() => {
            setPurpose("");
            setTemple("");
          }}
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 md:px-6 md:pt-10">
      {/* Search + sort */}
      <div className="flex gap-2">
        <label className="flex h-12 flex-1 items-center gap-2 rounded-full border border-border bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <Search className="h-4 w-4 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search puja…" className="h-full flex-1 bg-transparent text-sm outline-none" />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search">
              <X className="h-4 w-4 text-ink-muted" />
            </button>
          )}
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sort"
          className="hidden h-12 rounded-full border border-border bg-white px-4 text-sm shadow-[var(--shadow-soft)] outline-none md:block"
        >
          <option value="soonest">Closing soonest</option>
          <option value="popular">Most popular</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <button
          onClick={() => setSheet(true)}
          className="relative grid h-12 w-12 place-items-center rounded-full border border-border bg-white shadow-[var(--shadow-soft)] lg:hidden"
          aria-label="Filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeCount > 0 && <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[0.65rem] text-white">{activeCount}</span>}
        </button>
      </div>

      {/* Deity chips */}
      <div className="no-scrollbar -mx-4 mt-5 flex gap-2.5 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {["All", ...deities].map((d) => {
          const on = deity === d;
          return (
            <button
              key={d}
              onClick={() => setDeity(d)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm font-medium transition",
                on ? "border-primary text-white" : "border-border bg-white text-ink hover:border-primary/60",
                d === "All" && "pl-4",
              )}
            >
              {on && <motion.span layoutId="deity-chip" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              {deityImages[d] && (
                <span className="relative h-7 w-7 overflow-hidden rounded-full">
                  <Image src={deityImages[d]} alt="" fill sizes="28px" className="object-cover" />
                </span>
              )}
              <span className="relative">{d}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-border bg-white p-5">
            <p className="mb-4 font-serif text-lg font-semibold">Filters</p>
            {filters}
          </div>
        </aside>
        <div>
          <p className="mb-4 text-sm text-ink-muted">
            Showing <b className="text-ink">{list.length}</b> {list.length === 1 ? "puja" : "pujas"}
          </p>
          <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((p, k) => (
                <motion.div
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.4, delay: Math.min(k, 6) * 0.04 }}
                >
                  <PujaCard puja={p} priority={k < 2} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {list.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-white py-16 text-center">
              <p className="font-serif text-xl">No pujas match your filters</p>
              <button
                className="mt-3 text-sm font-medium text-primary"
                onClick={() => {
                  setDeity("All");
                  setPurpose("");
                  setTemple("");
                  setQ("");
                }}
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              className="pb-safe fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-bg p-5"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, i) => i.offset.y > 120 && setSheet(false)}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-sand" />
              <div className="mb-5 flex items-center justify-between">
                <p className="font-serif text-xl font-semibold">Filters</p>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="h-10 rounded-full border border-border bg-white px-3 text-sm">
                  <option value="soonest">Closing soonest</option>
                  <option value="popular">Most popular</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="price-desc">Price ↓</option>
                </select>
              </div>
              {filters}
              <button onClick={() => setSheet(false)} className="mt-6 h-12 w-full rounded-full bg-primary font-medium text-white">
                Show {list.length} pujas
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
