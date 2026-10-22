"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Product, PujaCardT, TempleCardT } from "@/lib/types";
import { formatINR } from "@/lib/utils";

type Hit = { href: string; title: string; sub: string; image: string; tag: string };

/** One flat result list from the /search response. */
const toHits = ({ pujas, products, temples }: { pujas: PujaCardT[]; products: Product[]; temples: TempleCardT[] }): Hit[] =>
  [
    ...pujas.map((p) => ({ href: `/puja/${p.slug}`, title: p.title, sub: p.subtitle, image: p.images[0], tag: "Puja" })),
    ...products.map((p) => ({ href: `/store/product/${p.slug}`, title: p.name, sub: formatINR(p.price), image: p.images[0], tag: "Shop" })),
    ...temples.map((t) => ({ href: `/temples/${t.slug}`, title: t.name, sub: `${t.city}, ${t.state}`, image: t.image, tag: "Temple" })),
  ].slice(0, 10);

const trending = ["Rudraksha", "Lakshmi Puja", "Kali Puja", "Ganga Jal", "Shri Yantra"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [results, setResults] = useState<Hit[]>([]);
  const [searching, setSearching] = useState(false);

  // debounced server search
  useEffect(() => {
    const s = q.trim();
    if (!s) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await api<{ pujas: PujaCardT[]; products: Product[]; temples: TempleCardT[] }>(`/search?q=${encodeURIComponent(s)}`, { signal: ctrl.signal });
        setResults(toHits(r));
      } catch {
        if (!ctrl.signal.aborted) setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);


  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="pt-safe mx-auto mt-0 max-w-2xl rounded-b-3xl bg-bg p-4 shadow-2xl md:mt-16 md:rounded-3xl md:p-6"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <Search className="h-5 w-5 text-primary" />
              <input
                ref={ref}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pujas, temples, products…"
                className="h-14 flex-1 bg-transparent text-base outline-none"
              />
              <button onClick={onClose} aria-label="Close search" className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand/60">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!q && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold tracking-wider text-ink-muted uppercase">Trending</p>
                <div className="flex flex-wrap gap-2">
                  {trending.map((t) => (
                    <button key={t} onClick={() => setQ(t.split(" ")[0])} className="rounded-full border border-border bg-white px-4 py-2 text-sm transition hover:border-primary hover:text-primary">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {q && (
              <ul className="mt-4 max-h-[60vh] space-y-1 overflow-y-auto">
                {results.length === 0 && !searching && <li className="py-10 text-center text-sm text-ink-muted">No results for “{q}”</li>}
                {results.map((r, i) => (
                  <motion.li key={r.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link href={r.href} onClick={onClose} className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white">
                      <Image src={r.image || "/assets/brand/emblem-256.png"} alt="" width={56} height={56} className="h-14 w-14 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{r.title}</p>
                        <p className="truncate text-sm text-ink-muted">{r.sub}</p>
                      </div>
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.65rem] font-semibold text-primary">{r.tag}</span>
                      <ArrowUpRight className="h-4 w-4 text-ink-muted transition group-hover:text-primary" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
