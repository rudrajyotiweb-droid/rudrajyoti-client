"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Sort = "popular" | "price-asc" | "price-desc" | "rating";

export function StoreListing({ products, categories, category: initial = "all" }: { products: Product[]; categories: Category[]; category?: string }) {
  const priceCap = Math.max(500, Math.ceil(Math.max(0, ...products.map((p) => p.price)) / 100) * 100);
  const [cat, setCat] = useState(initial);
  const [sort, setSort] = useState<Sort>("popular");
  const [maxPrice, setMaxPrice] = useState(priceCap);
  const [inStock, setInStock] = useState(false);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.toLowerCase();
    return products
      .filter((p) => (cat === "all" || p.category === cat || categories.find((c) => c.slug === p.category)?.parent === cat) && p.price <= maxPrice && (!inStock || p.stock > 0) && (!s || p.name.toLowerCase().includes(s)))
      .sort((a, b) =>
        sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : b.reviews - a.reviews,
      );
  }, [products, categories, cat, sort, maxPrice, inStock, q]);

  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
        {[{ slug: "all", name: "All" }, ...categories.filter((c) => !c.parent)].map((c) => (
          <button
            key={c.slug}
            onClick={() => setCat(c.slug)}
            className={cn("relative shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition", cat === c.slug ? "border-primary text-white" : "border-border bg-white hover:border-primary/60")}
          >
            {cat === c.slug && <motion.span layoutId="store-chip" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative">{c.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex h-11 min-w-[12rem] flex-1 items-center gap-2 rounded-full border border-border bg-white px-4 focus-within:border-primary">
          <Search className="h-4 w-4 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="h-full flex-1 bg-transparent text-sm outline-none" />
        </label>
        <label className="flex h-11 items-center gap-3 rounded-full border border-border bg-white px-4 text-sm">
          <span className="text-ink-muted">Up to</span>
          <input type="range" min={100} max={priceCap} step={50} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-24 accent-primary" aria-label="Max price" />
          <b className="w-12 tabular-nums">₹{maxPrice}</b>
        </label>
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 text-sm">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-primary" /> In stock
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="h-11 rounded-full border border-border bg-white px-4 text-sm outline-none">
          <option value="popular">Popular</option>
          <option value="rating">Top rated</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      <p className="mt-5 mb-4 text-sm text-ink-muted">
        <b className="text-ink">{list.length}</b> products
      </p>
      <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, k) => (
            <motion.div key={p.slug} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: Math.min(k, 8) * 0.03 }} className="h-full">
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="rounded-3xl border border-dashed border-border bg-white py-16 text-center text-ink-muted">No products match these filters.</p>}
    </div>
  );
}
