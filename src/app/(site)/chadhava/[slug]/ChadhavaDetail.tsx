"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Check, MapPin, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/layout/PageHeader";
import { IstDate } from "@/components/ui/IstDate";
import { Diya, Ornament } from "@/components/ui/Ornament";
import { Accordion, Field, QtyStepper, inputCls } from "@/components/ui/misc";
import { api, errorMessage } from "@/lib/api";
import { runPayment } from "@/lib/payment";
import type { ChadhavaDetailT, CheckoutInfo } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { toast, useAuth } from "@/store";

export function ChadhavaDetail({ c, faqs }: { c: ChadhavaDetailT; faqs: { q: string; a: string }[] }) {
  const t = c.temple;
  const router = useRouter();
  const user = useAuth((x) => x.user);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [gotra, setGotra] = useState("");
  const [unknownGotra, setUnknownGotra] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const storeKey = `rj-chadhava-${c.slug}`;

  const total = c.items.reduce((s, i) => s + i.price * (qty[i.id] ?? 0), 0);
  const count = Object.values(qty).reduce((a, b) => a + b, 0);

  // keep the selection across the sign-in round trip
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storeKey) ?? "null");
      if (saved?.qty) setQty(saved.qty);
    } catch {}
  }, [storeKey]);
  useEffect(() => {
    try {
      sessionStorage.setItem(storeKey, JSON.stringify({ qty }));
    } catch {}
  }, [qty, storeKey]);
  useEffect(() => {
    if (!user) return;
    setName((n) => n || user.name);
    setGotra((g) => g || user.gotra);
    setWhatsapp((w) => w || user.phone);
  }, [user]);

  const valid = name.trim().length > 1 && /^[6-9]\d{9}$/.test(whatsapp) && (unknownGotra || gotra.trim().length > 1);

  const offer = async () => {
    if (!user) return router.push(`/login?next=${encodeURIComponent(`/chadhava/${c.slug}`)}`);
    if (!valid) return toast("Please fill the devotee name, gotra and WhatsApp number", "error");
    if (paying) return;
    setPaying(true);
    try {
      const res = pendingCode
        ? await api<{ code: string; checkout: CheckoutInfo }>("/checkout/retry", { body: { code: pendingCode } })
        : await api<{ code: string; checkout: CheckoutInfo }>("/checkout/chadhava", {
            body: {
              slug: c.slug,
              items: Object.entries(qty)
                .filter(([, q]) => q > 0)
                .map(([id, q]) => ({ id, qty: q })),
              name: name.trim(),
              gotra: unknownGotra ? "" : gotra.trim(),
              unknownGotra,
              whatsapp,
            },
          });
      setPendingCode(res.code);
      const r = await runPayment(res.checkout);
      if (!r || r.status === "success") {
        try {
          sessionStorage.removeItem(storeKey);
        } catch {}
        setDone(res.code);
        window.scrollTo({ top: 0 });
      } else if (r.status === "pending") router.push(`/payment/status?orderId=${encodeURIComponent(r.orderId)}`);
      else toast(r.message ? `Payment failed: ${r.message}. You can try again.` : "Payment failed. You can try again.", "error");
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setPaying(false);
    }
  };

  const ctaLabel = !c.bookingOpen ? "Offerings closed" : paying ? "Processing…" : user ? "Offer Now" : "Sign in to offer";

  if (done)
    return (
      <div className="mandala-bg mx-auto max-w-md px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="mx-auto w-fit">
          <Diya className="h-24 w-24" />
        </motion.div>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-primary">Offering booked</h1>
        <Ornament className="mx-auto mt-2" />
        <p className="mt-3 text-ink-muted">
          Booking <b className="text-ink">{done}</b> — your chadhava will be offered at {t?.name ?? "the temple"} on <IstDate iso={c.date} opts={{ weekday: undefined }} />. The video will reach your WhatsApp.
        </p>
        <Link href="/account/bookings" className="mt-6 inline-block font-medium text-primary hover:underline">
          View my bookings
        </Link>
      </div>
    );

  return (
    <div className="pb-40 lg:pb-10">
      <section className="relative h-[42vh] min-h-[280px] overflow-hidden md:h-[52vh]">
        <Image src={c.image} alt={c.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d0505]/90 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 text-white md:px-6">
          <Breadcrumb light items={[["Home", "/"], ["Chadhava", "/chadhava"], [c.title]]} />
          <h1 className="mt-3 font-serif text-3xl font-semibold md:text-5xl">{c.title}</h1>
          <p className="mt-1 text-white/85">{c.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {t && (
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                <MapPin className="h-3.5 w-3.5" /> {t.name}, {t.city}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              <CalendarDays className="h-3.5 w-3.5" /> <IstDate iso={c.date} /> · {c.tithi}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              <Video className="h-3.5 w-3.5" /> Video on WhatsApp
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-8 md:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-serif text-2xl font-semibold">About this offering</h2>
            <Ornament className="mt-1 -ml-1" />
            <p className="mt-3 leading-relaxed text-ink-muted">{c.about}</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">Choose your offerings</h2>
            <Ornament className="mt-1 -ml-1" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {c.items.map((i, k) => {
                const q = qty[i.id] ?? 0;
                const soldOut = i.available === 0;
                return (
                  <motion.div
                    key={i.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: k * 0.05 }}
                    className={cn("flex gap-3 rounded-2xl border-2 bg-white p-3 transition", q ? "border-primary shadow-[var(--shadow-glow)]" : "border-border", soldOut && "opacity-60")}
                  >
                    <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                      <Image src={i.image} alt="" fill sizes="96px" className="object-cover" />
                      <AnimatePresence>
                        {q > 0 && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute top-1.5 left-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-white">
                            <Check className="h-3.5 w-3.5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="font-semibold">{i.name}</p>
                      <p className="line-clamp-2 text-xs text-ink-muted">{i.desc}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="font-semibold text-primary">{formatINR(i.price)}</span>
                        {q === 0 ? (
                          <button onClick={() => setQty({ ...qty, [i.id]: 1 })} disabled={soldOut || !c.bookingOpen} className="h-8 rounded-full border border-primary px-4 text-xs font-semibold text-primary hover:bg-primary hover:text-white disabled:pointer-events-none">
                            {soldOut ? "Sold out" : "Add"}
                          </button>
                        ) : (
                          <QtyStepper size="sm" value={q} onChange={(v) => setQty({ ...qty, [i.id]: v })} max={Math.min(21, i.available ?? 21)} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-white p-5 md:p-6">
            <h2 className="font-serif text-xl font-semibold">Offer in the name of</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Devotee name">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} />
              </Field>
              <Field label="Gotra">
                <input value={unknownGotra ? "Kashyap" : gotra} disabled={unknownGotra} onChange={(e) => setGotra(e.target.value)} placeholder="e.g. Bharadwaj" className={cn(inputCls, unknownGotra && "bg-bg text-ink-muted")} />
              </Field>
              <Field label="WhatsApp number" hint="The offering video is sent here.">
                <input inputMode="numeric" maxLength={10} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile" className={inputCls} />
              </Field>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" checked={unknownGotra} onChange={(e) => setUnknownGotra(e.target.checked)} className="h-4.5 w-4.5 accent-primary" />
              I don&apos;t know my gotra <span className="text-xs text-ink-muted">(Kashyap will be used as per shastra)</span>
            </label>
          </section>

          {faqs.length > 0 && (
            <section>
              <h2 className="mb-4 font-serif text-2xl font-semibold">FAQs</h2>
              <Accordion items={faqs} />
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-lift)]">
            <p className="font-serif text-xl font-semibold">Your offering</p>
            {count === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">Select at least one item to continue.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {c.items
                  .filter((i) => qty[i.id])
                  .map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span>
                        {i.name} × {qty[i.id]}
                      </span>
                      <span>{formatINR(i.price * qty[i.id])}</span>
                    </li>
                  ))}
              </ul>
            )}
            <div className="mt-4 flex justify-between border-t border-border pt-3 font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatINR(total)}</span>
            </div>
            <button onClick={offer} disabled={!count || paying || !c.bookingOpen} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-white shadow-[var(--shadow-glow)] disabled:opacity-50">
              {ctaLabel} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="pb-safe fixed inset-x-0 bottom-[calc(3.6rem+var(--safe-bottom))] z-30 border-t border-border bg-white/95 px-4 pt-3 backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center gap-3 pb-1">
              <div className="flex-1">
                <p className="text-lg font-semibold text-primary">{formatINR(total)}</p>
                <p className="text-xs text-ink-muted">{count} offerings</p>
              </div>
              <button onClick={offer} disabled={paying || !c.bookingOpen} className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-white shadow-[var(--shadow-glow)] disabled:opacity-50">
                {ctaLabel} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
