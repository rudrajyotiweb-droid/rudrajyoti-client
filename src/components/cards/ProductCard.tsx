"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useHydrated } from "@/lib/hooks";
import { cn, discountPct, formatINR } from "@/lib/utils";
import { useCart, useUi, useWishlist } from "@/store";

export function WishButton({ slug, className }: { slug: string; className?: string }) {
  const hydrated = useHydrated();
  const { slugs, toggle } = useWishlist();
  const show = useUi((s) => s.showToast);
  const on = hydrated && slugs.includes(slug);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={on}
      onClick={async (e) => {
        e.preventDefault();
        const added = await toggle(slug);
        show(added ? "Saved to wishlist" : "Removed from wishlist", "info");
      }}
      className={cn("grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-md backdrop-blur transition hover:scale-110", className)}
    >
      <motion.span key={String(on)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
        <Heart className={cn("h-4 w-4", on ? "fill-primary text-primary" : "text-ink")} />
      </motion.span>
    </motion.button>
  );
}

export function AddToCartButton({ slug, className, full }: { slug: string; className?: string; full?: boolean }) {
  const add = useCart((s) => s.add);
  const show = useUi((s) => s.showToast);
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        add(slug);
        show("Added to cart");
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className={cn(
        "relative inline-flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-full text-xs font-semibold transition-all active:scale-95",
        done ? "bg-success text-white" : "bg-primary text-white hover:bg-primary-dark",
        full ? "w-full" : "px-4",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={String(done)} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="inline-flex items-center gap-1.5">
          {done ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-3.5 w-3.5" />}
          {done ? "Added" : "Add to Cart"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const off = discountPct(product.price, product.mrp);
  return (
    <Link
      href={`/store/product/${product.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-bg-alt">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 260px"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            fill
            sizes="(max-width: 768px) 45vw, 260px"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        {off > 0 && <span className="absolute top-2.5 left-2.5 rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-bold text-white">-{off}%</span>}
        {product.badge && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/95 px-2 py-0.5 text-[0.62rem] font-semibold text-primary">{product.badge}</span>
        )}
        <WishButton slug={product.slug} className="absolute top-2 right-2" />
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-ink md:text-[0.95rem]">{product.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {product.rating}
          <span className="text-ink-muted/70">({product.reviews})</span>
        </p>
        <p className="mt-1.5 flex items-baseline gap-2">
          <span className="font-semibold text-primary md:text-lg">{formatINR(product.price)}</span>
          {off > 0 && <span className="text-xs text-ink-muted line-through">{formatINR(product.mrp)}</span>}
        </p>
        <div className="mt-auto pt-3">
          <AddToCartButton slug={product.slug} full />
        </div>
      </div>
    </Link>
  );
}
