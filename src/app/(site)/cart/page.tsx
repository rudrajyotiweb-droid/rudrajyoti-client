"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/cards/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { QtyStepper } from "@/components/ui/misc";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useApi, useHydrated, useProductsBySlug } from "@/lib/hooks";
import { useSite } from "@/lib/site";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/store";

export default function CartPage() {
  const hydrated = useHydrated();
  const { lines, setQty, remove } = useCart();
  const ship = useSite().shipping;
  const { map, loading, error } = useProductsBySlug(hydrated ? lines.map((l) => l.slug) : []);
  const bestsellers = useApi<Product[]>("/products?bestseller=true&limit=12").data ?? [];
  // products that were removed from the store simply drop out of the cart view
  const items = lines.flatMap((l) => {
    const p = map.get(l.slug);
    return p ? [{ ...l, p }] : [];
  });
  const subtotal = items.reduce((t, x) => t + x.p.price * x.qty, 0);
  const mrp = items.reduce((t, x) => t + x.p.mrp * x.qty, 0);
  const left = Math.max(0, ship.freeShippingThreshold - subtotal);
  const shipping = subtotal === 0 || left === 0 ? 0 : ship.standardFee;
  const crossSell = bestsellers.filter((p) => !lines.some((l) => l.slug === p.slug)).slice(0, 4);

  if (!hydrated || (loading && lines.length > 0 && items.length === 0)) return <div className="mx-auto max-w-5xl px-4 py-10"><div className="skeleton h-64 rounded-3xl" /></div>;

  if (error && items.length === 0 && lines.length > 0)
    return <div className="mx-auto max-w-md px-4 py-20 text-center text-ink-muted">{error}</div>;

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary-soft text-primary">
          <ShoppingBag className="h-10 w-10" />
        </motion.div>
        <h1 className="mt-6 font-serif text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-ink-muted">Explore authentic puja samagri and spiritual products.</p>
        <ButtonLink href="/store" className="mt-6">
          Start shopping <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-40 md:px-6 md:pt-10 lg:pb-10">
      <h1 className="font-serif text-3xl font-semibold md:text-4xl">Your Cart</h1>
      <p className="mt-1 text-sm text-ink-muted">{items.length} items</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {/* free shipping progress */}
          <div className="mb-4 rounded-2xl border border-border bg-white p-4">
            <p className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-primary" />
              {left > 0 ? (
                <span>
                  Add <b className="text-primary">{formatINR(left)}</b> more for <b>FREE shipping</b>
                </span>
              ) : (
                <span className="font-medium text-success">You&apos;ve unlocked FREE shipping 🎉</span>
              )}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-primary" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (subtotal / Math.max(1, ship.freeShippingThreshold)) * 100)}%` }} transition={{ duration: 0.8 }} />
            </div>
          </div>

          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map(({ p, qty, variant }) => (
                <motion.li key={p.slug + variant} layout exit={{ opacity: 0, x: -60, height: 0, marginTop: 0 }} className="flex gap-4 rounded-2xl border border-border bg-white p-3 md:p-4">
                  <Link href={`/store/product/${p.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl md:h-28 md:w-28">
                    <Image src={p.images[0]} alt={p.name} fill sizes="112px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/store/product/${p.slug}`} className="line-clamp-2 font-medium hover:text-primary">
                        {p.name}
                      </Link>
                      <button onClick={() => remove(p.slug, variant)} aria-label={`Remove ${p.name}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-primary-soft hover:text-primary">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {variant && <p className="text-xs text-ink-muted">{variant}</p>}
                    {p.stock < qty && <p className="text-xs font-medium text-primary">{p.stock === 0 ? "Out of stock — please remove" : `Only ${p.stock} left`}</p>}
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <QtyStepper size="sm" value={qty} onChange={(v) => setQty(p.slug, v, variant)} min={1} max={Math.max(1, Math.min(10, p.stock))} />
                      <p className="text-right">
                        <span className="block font-semibold text-primary">{formatINR(p.price * qty)}</span>
                        <span className="text-xs text-ink-muted line-through">{formatINR(p.mrp * qty)}</span>
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="font-serif text-xl font-semibold">Price details</p>
            <div className="mt-4 space-y-2.5 text-sm">
              <Row k="MRP total" v={formatINR(mrp)} />
              <Row k="Discount" v={<span className="text-success">−{formatINR(mrp - subtotal)}</span>} />
              <Row k="Shipping" v={shipping ? formatINR(shipping) : <span className="text-success">FREE</span>} />
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatINR(subtotal + shipping)}</span>
              </div>
              <p className="rounded-xl bg-success/10 px-3 py-2 text-xs font-medium text-success">You save {formatINR(mrp - subtotal)} on this order</p>
            </div>
            <ButtonLink href="/checkout" className="mt-5 hidden w-full lg:flex" size="lg">
              Checkout <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </aside>
      </div>

      {crossSell.length > 0 && (
      <section className="pt-14">
        <SectionHeading title="Complete your puja" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {crossSell.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
      )}

      <div className="pb-safe fixed inset-x-0 bottom-[calc(3.6rem+var(--safe-bottom))] z-30 border-t border-border bg-white/95 px-4 pt-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3 pb-1">
          <div className="flex-1">
            <p className="text-lg font-semibold text-primary">{formatINR(subtotal + shipping)}</p>
            <p className="text-xs text-success">Saved {formatINR(mrp - subtotal)}</p>
          </div>
          <ButtonLink href="/checkout">
            Checkout <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex justify-between">
    <span className="text-ink-muted">{k}</span>
    <span>{v}</span>
  </div>
);
