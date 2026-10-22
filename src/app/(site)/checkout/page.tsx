"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Banknote, Check, CheckCircle2, Lock, MapPin, Plus, Smartphone, Truck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Diya, Ornament } from "@/components/ui/Ornament";
import { inputCls } from "@/components/ui/misc";
import { api, ApiError, errorMessage } from "@/lib/api";
import { useHydrated, useProductsBySlug } from "@/lib/hooks";
import { runPayment } from "@/lib/payment";
import { useSite } from "@/lib/site";
import type { CheckoutInfo } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { toast, useAuth, useCart } from "@/store";

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { lines, clear } = useCart();
  const user = useAuth((s) => s.user);
  const reloadUser = useAuth((s) => s.reload);
  const ship = useSite().shipping;
  const addresses = useMemo(() => user?.addresses ?? [], [user]);
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [pay, setPay] = useState<"online" | "cod">("online");
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  // checkout needs a signed-in devotee (orders are linked to the account)
  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=${encodeURIComponent("/checkout")}`);
  }, [hydrated, user, router]);
  useEffect(() => {
    void reloadUser();
  }, [reloadUser]);
  useEffect(() => {
    if (!address || !addresses.some((a) => a.id === address)) setAddress(addresses.find((a) => a.default)?.id ?? addresses[0]?.id ?? "");
  }, [addresses, address]);

  const { map, loading } = useProductsBySlug(hydrated ? lines.map((l) => l.slug) : []);
  const items = lines.flatMap((l) => {
    const p = map.get(l.slug);
    return p ? [{ ...l, p }] : [];
  });
  const subtotal = items.reduce((t, x) => t + x.p.price * x.qty, 0);
  const discount = applied?.discount ?? 0;
  // same formula as the server (backend/src/routes/checkout.js)
  const shipping = (subtotal - discount >= ship.freeShippingThreshold ? 0 : ship.standardFee) + (delivery === "express" ? ship.expressFee : 0);
  const cod = pay === "cod" ? ship.codFee : 0;
  const total = subtotal - discount + shipping + cod;
  const outOfStock = items.some((x) => x.p.stock < x.qty);

  // a coupon is re-checked whenever the cart total changes
  useEffect(() => {
    if (!applied || !user) return;
    let live = true;
    api<{ code: string; discount: number }>("/checkout/coupon", { body: { code: applied.code, kind: "Store", subtotal } })
      .then((r) => live && r.discount !== applied.discount && setApplied({ code: r.code, discount: r.discount }))
      .catch((e) => {
        if (!live) return;
        setApplied(null);
        toast(errorMessage(e), "error");
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const r = await api<{ code: string; discount: number }>("/checkout/coupon", { body: { code: coupon.trim(), kind: "Store", subtotal } });
      setApplied({ code: r.code, discount: r.discount });
      toast(`Coupon applied — you save ${formatINR(r.discount)}`);
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const done = (code: string) => {
    setOrderId(code);
    clear();
    window.scrollTo({ top: 0 });
  };

  const place = async () => {
    if (placing) return;
    if (!address) return toast("Please add a delivery address", "error");
    if (outOfStock) return toast("Some items are out of stock. Please update your cart.", "error");
    setPlacing(true);
    try {
      const res = pendingCode
        ? await api<{ code: string; checkout: CheckoutInfo }>("/checkout/retry", { body: { code: pendingCode } })
        : await api<{ code: string; checkout: CheckoutInfo }>("/checkout/order", {
            body: { items: items.map(({ p, qty, variant }) => ({ slug: p.slug, qty, ...(variant ? { variant } : {}) })), addressId: address, delivery, payment: pay, ...(applied ? { coupon: applied.code } : {}) },
          });
      if (res.checkout.provider === "cod") return done(res.code);
      setPendingCode(res.code);
      const r = await runPayment(res.checkout);
      if (!r || r.status === "success") return done(res.code);
      if (r.status === "pending") {
        clear();
        return router.push(`/payment/status?orderId=${encodeURIComponent(r.orderId)}`);
      }
      toast(r.message ? `Payment failed: ${r.message}. You can try again.` : "Payment failed. You can try again.", "error");
    } catch (e) {
      // the cart changed on the server side (stock) — make it visible
      if (e instanceof ApiError && e.code === "OUT_OF_STOCK") setPendingCode(null);
      toast(errorMessage(e), "error");
    } finally {
      setPlacing(false);
    }
  };

  if (!hydrated || !user || (loading && lines.length > 0 && items.length === 0))
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );

  if (orderId)
    return (
      <div className="mandala-bg mx-auto max-w-lg px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="mx-auto w-fit">
          <Diya className="h-24 w-24" />
        </motion.div>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-primary">Order placed!</h1>
        <Ornament className="mx-auto mt-2" />
        <p className="mt-3 text-ink-muted">Thank you. Your order <b className="font-mono text-ink">{orderId}</b> will be packed with care and shipped soon.</p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/account/orders">Track order</ButtonLink>
          <ButtonLink href="/store" variant="outline">
            Continue shopping
          </ButtonLink>
        </div>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-serif text-2xl">Nothing to checkout</p>
        <ButtonLink href="/store" className="mt-5">
          Go to shop
        </ButtonLink>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-36 md:px-6 md:pt-10 lg:pb-10">
      <div className="flex items-center gap-3">
        <Link href="/cart" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white" aria-label="Back to cart">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card n={1} title="Delivery address">
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.length === 0 && <p className="text-sm text-ink-muted sm:col-span-2">You have no saved address yet.</p>}
              {addresses.map((a) => (
                <button key={a.id} onClick={() => setAddress(a.id)} className={cn("rounded-2xl border-2 p-4 text-left text-sm transition", address === a.id ? "border-primary bg-primary-soft/30" : "border-border bg-white")}>
                  <span className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4 text-primary" /> {a.label}
                    {address === a.id && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                  </span>
                  <span className="mt-1 block">{a.name}</span>
                  <span className="block text-ink-muted">
                    {a.line}, {a.city}, {a.state} – {a.pin}
                  </span>
                </button>
              ))}
              <Link href={`/account/addresses?next=${encodeURIComponent("/checkout")}`} className="grid min-h-24 place-items-center rounded-2xl border-2 border-dashed border-border text-sm font-medium text-primary">
                <span className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add address
                </span>
              </Link>
            </div>
          </Card>

          <Card n={2} title="Delivery option">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["standard", Truck, "Standard", "4–6 days", subtotal - discount >= ship.freeShippingThreshold ? "FREE" : formatINR(ship.standardFee)],
                ["express", Zap, "Express", "1–3 days", `+${formatINR(ship.expressFee)}`],
              ].map(([id, I, t, d, price]) => {
                const C = I as typeof Truck;
                return (
                  <button key={id as string} onClick={() => setDelivery(id as "standard")} className={cn("flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition", delivery === id ? "border-primary" : "border-border bg-white")}>
                    <C className="h-5 w-5 text-primary" />
                    <span className="flex-1">
                      <b className="block text-sm">{t as string}</b>
                      <span className="text-xs text-ink-muted">{d as string}</span>
                    </span>
                    <span className="text-sm font-semibold">{price as string}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card n={3} title="Payment">
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => setPay("online")} className={cn("flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition", pay === "online" ? "border-primary" : "border-border bg-white")}>
                <Smartphone className="h-5 w-5 text-primary" />
                <span>
                  <b className="block text-sm">Pay online</b>
                  <span className="text-xs text-ink-muted">UPI, cards, netbanking, wallets</span>
                </span>
              </button>
              {ship.codEnabled && (
              <button onClick={() => setPay("cod")} className={cn("flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition", pay === "cod" ? "border-primary" : "border-border bg-white")}>
                <Banknote className="h-5 w-5 text-primary" />
                <span>
                  <b className="block text-sm">Cash on delivery</b>
                  <span className="text-xs text-ink-muted">+{formatINR(ship.codFee)} COD fee</span>
                </span>
              </button>
              )}
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
            <p className="font-serif text-xl font-semibold">Order summary</p>
            <ul className="mt-4 max-h-60 space-y-3 overflow-y-auto">
              {items.map(({ p, qty, variant }) => (
                <li key={p.slug + variant} className="flex items-center gap-3 text-sm">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />
                    <span className="absolute top-0 right-0 grid h-5 w-5 place-items-center rounded-bl-lg bg-ink text-[0.6rem] text-white">{qty}</span>
                  </span>
                  <span className="line-clamp-2 flex-1">
                    {p.name}
                    {variant && <span className="block text-xs text-ink-muted">{variant}</span>}
                    {p.stock < qty && <span className="block text-xs font-medium text-primary">{p.stock === 0 ? "Out of stock" : `Only ${p.stock} left`}</span>}
                  </span>
                  <span className="font-medium">{formatINR(p.price * qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <Row k="Subtotal" v={formatINR(subtotal)} />
              {applied ? (
                <div className="flex items-center justify-between rounded-xl bg-success/10 px-3 py-2 text-xs font-semibold text-success">
                  <span>{applied.code} · −{formatINR(applied.discount)}</span>
                  <button onClick={() => setApplied(null)} className="underline">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && applyCoupon()} placeholder="Coupon code" className={cn(inputCls, "h-10 text-sm")} />
                  <button onClick={applyCoupon} disabled={!coupon.trim()} className="h-10 rounded-xl bg-ink px-4 text-xs font-semibold text-white disabled:opacity-50">
                    Apply
                  </button>
                </div>
              )}
              <Row k="Shipping" v={shipping ? formatINR(shipping) : <span className="text-success">FREE</span>} />
              {cod > 0 && <Row k="COD fee" v={formatINR(cod)} />}
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatINR(total)}</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <PlaceButton placing={placing} onClick={place} total={total} cod={pay === "cod"} />
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
              <Lock className="h-3.5 w-3.5 text-success" /> Payments secured by Paytm
            </p>
          </div>
        </aside>
      </div>

      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 pt-3 pb-2 backdrop-blur-xl lg:hidden">
        <PlaceButton placing={placing} onClick={place} total={total} cod={pay === "cod"} />
      </div>
    </div>
  );
}

function PlaceButton({ placing, onClick, total, cod }: { placing: boolean; onClick: () => void; total: number; cod: boolean }) {
  return (
    <button onClick={onClick} disabled={placing} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-white shadow-[var(--shadow-glow)] transition hover:bg-primary-dark disabled:opacity-70 lg:mt-5">
      {placing ? (
        <motion.span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
      ) : (
        <Check className="h-4 w-4" />
      )}
      {placing ? "Placing order…" : cod ? `Place order · ${formatINR(total)}` : `Pay ${formatINR(total)}`}
    </button>
  );
}

function Card({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-soft)] md:p-6">
      <h2 className="mb-4 flex items-center gap-3 font-serif text-xl font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-sans text-sm text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex justify-between">
    <span className="text-ink-muted">{k}</span>
    <span>{v}</span>
  </div>
);
