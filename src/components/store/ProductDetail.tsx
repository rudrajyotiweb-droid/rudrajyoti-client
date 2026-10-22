"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, Leaf, MapPin, RotateCcw, ShoppingCart, Sparkles, Truck, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WishButton } from "@/components/cards/ProductCard";
import { QtyStepper, Stars } from "@/components/ui/misc";
import { useSite } from "@/lib/site";
import type { ProductDetailT as Product } from "@/lib/types";
import { cn, discountPct, formatINR, initials } from "@/lib/utils";
import { useCart, useUi } from "@/store";

function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <div
      className="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-white"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseLeave={() => setPos(null)}
    >
      <AnimatePresence mode="wait">
        <motion.div key={src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover transition-transform duration-200"
            style={pos ? { transform: "scale(2)", transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function ProductDetail({ product: p }: { product: Product }) {
  const [img, setImg] = useState(0);
  const [variant, setVariant] = useState(p.variants?.options[1] ?? p.variants?.options[0]);
  const [qty, setQty] = useState(1);
  const freeShipping = useSite().shipping.freeShippingThreshold;
  const [tab, setTab] = useState<"desc" | "specs" | "use" | "ship">("desc");
  const [pin, setPin] = useState("");
  const [eta, setEta] = useState<string | null>(null);
  const add = useCart((s) => s.add);
  const toast = useUi((s) => s.showToast);
  const router = useRouter();
  const off = discountPct(p.price, p.mrp);

  const checkPin = () => {
    if (!/^\d{6}$/.test(pin)) return setEta("Enter a valid 6-digit pincode");
    const d = new Date(Date.now() + (3 + (Number(pin[0]) % 3)) * 86_400_000);
    setEta(`Delivery by ${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}`);
  };

  const tabs = [
    ["desc", "Description"],
    ["specs", "Specifications"],
    ...(p.howToUse ? [["use", "How to use"]] : []),
    ["ship", "Shipping & Returns"],
  ] as [typeof tab, string][];

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-4 md:px-6 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative">
            <ZoomImage src={p.images[img]} alt={p.name} />
            {off > 0 && <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">-{off}%</span>}
            <WishButton slug={p.slug} className="absolute top-3 right-3 h-11 w-11" />
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {p.images.map((src, i) => (
                <button key={src} onClick={() => setImg(i)} className={cn("relative h-20 w-20 overflow-hidden rounded-2xl ring-2 transition", i === img ? "ring-primary" : "opacity-70 ring-transparent hover:opacity-100")}>
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {p.badge && <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{p.badge}</span>}
          <h1 className="mt-3 font-serif text-3xl leading-tight font-semibold md:text-4xl">{p.name}</h1>
          <p className="mt-2 text-ink-muted">{p.short}</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Stars value={p.rating} />
            <b>{p.rating}</b>
            <span className="text-ink-muted">({p.reviews} reviews)</span>
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-primary">{formatINR(p.price)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-ink-muted line-through">{formatINR(p.mrp)}</span>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-sm font-semibold text-success">{off}% off</span>
              </>
            )}
          </div>
          <p className="text-xs text-ink-muted">Inclusive of all taxes</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              [BadgeCheck, "100% Original"],
              [Sparkles, "Energised"],
              [Truck, "Fast Delivery"],
            ].map(([I, t]) => {
              const C = I as typeof Truck;
              return (
                <div key={t as string} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-white py-3 text-center text-xs font-medium">
                  <C className="h-5 w-5 text-primary" /> {t as string}
                </div>
              );
            })}
          </div>

          {p.variants && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">
                {p.variants.label}: <span className="text-primary">{variant}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {p.variants.options.map((o) => (
                  <button
                    key={o}
                    onClick={() => setVariant(o)}
                    className={cn("rounded-full border-2 px-4 py-2 text-sm transition", variant === o ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border bg-white hover:border-primary/50")}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-border bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" /> Check delivery
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="Enter pincode"
                className="h-11 flex-1 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary"
              />
              <button onClick={checkPin} className="h-11 rounded-xl px-4 text-sm font-semibold text-primary hover:bg-primary-soft">
                Check
              </button>
            </div>
            <AnimatePresence>
              {eta && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={cn("mt-2 flex items-center gap-1 text-sm", eta.startsWith("Enter") ? "text-primary" : "text-success")}>
                  {!eta.startsWith("Enter") && <Check className="h-4 w-4" />} {eta}
                  {!eta.startsWith("Enter") && p.price >= freeShipping && " · Free shipping"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 hidden items-center gap-3 lg:flex">
            <QtyStepper value={qty} onChange={setQty} min={1} max={Math.max(1, Math.min(10, p.stock))} />
            <button
              onClick={() => {
                add(p.slug, qty, variant);
                toast("Added to cart");
              }}
              disabled={p.stock === 0}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-primary font-medium text-primary transition hover:bg-primary-soft disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <button
              onClick={() => {
                add(p.slug, qty, variant);
                router.push("/checkout");
              }}
              disabled={p.stock === 0}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary font-medium text-white shadow-[var(--shadow-glow)] transition hover:bg-primary-dark disabled:opacity-50"
            >
              <Zap className="h-4 w-4" /> Buy Now
            </button>
          </div>
          {p.stock === 0 ? (
            <p className="mt-3 text-sm font-medium text-primary">Out of stock — check back soon</p>
          ) : (
            p.stock <= 15 && <p className="mt-3 text-sm font-medium text-primary">Only {p.stock} left in stock — order soon</p>
          )}

          {/* Tabs */}
          <div className="mt-8">
            <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border">
              {tabs.map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} className={cn("relative shrink-0 px-4 py-3 text-sm font-medium transition", tab === id ? "text-primary" : "text-ink-muted hover:text-ink")}>
                  {label}
                  {tab === id && <motion.span layoutId="pd-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-5 text-sm leading-relaxed text-ink-muted">
                {tab === "desc" && <p>{p.description}</p>}
                {tab === "specs" && (
                  <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
                    {p.specs.map(([k, v]) => (
                      <div key={k} className="flex px-4 py-3">
                        <dt className="w-36 shrink-0 text-ink-muted">{k}</dt>
                        <dd className="font-medium text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {tab === "use" && (
                  <p className="flex gap-2">
                    <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {p.howToUse}
                  </p>
                )}
                {tab === "ship" && (
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <Truck className="h-4 w-4 shrink-0 text-primary" /> Free shipping on orders above {formatINR(freeShipping)}. Dispatched in 24–48 hours.
                    </li>
                    <li className="flex gap-2">
                      <RotateCcw className="h-4 w-4 shrink-0 text-primary" /> Returns within 7 days for damaged or wrong items only.
                    </li>
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {p.reviewList.length > 0 && (
            <div className="mt-4">
              <p className="mb-3 font-serif text-xl font-semibold">Customer reviews</p>
              <div className="space-y-3">
                {p.reviewList.slice(0, 6).map((r) => (
                  <div key={r.id} className="rounded-2xl border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-semibold text-white">{initials(r.name)}</span>
                      <div className="text-sm">
                        <b>{r.name}</b>
                        <div className="flex items-center gap-2">
                          <Stars value={r.rating} size={12} />
                          <span className="text-xs text-ink-muted">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-ink-muted">{r.text}</p>
                    {r.reply && <p className="mt-2 rounded-xl bg-bg px-3 py-2 text-xs"><b>Rudra Jyoti:</b> {r.reply}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile sticky actions */}
      <div className="pb-safe fixed inset-x-0 bottom-[calc(3.6rem+var(--safe-bottom))] z-30 border-t border-border bg-white/95 px-4 pt-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2 pb-1">
          <QtyStepper value={qty} onChange={setQty} min={1} max={Math.max(1, Math.min(10, p.stock))} size="sm" />
          <button
            onClick={() => {
              add(p.slug, qty, variant);
              toast("Added to cart");
            }}
            disabled={p.stock === 0}
            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-medium text-white shadow-[var(--shadow-glow)] active:scale-95 disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </button>
        </div>
      </div>
    </>
  );
}
