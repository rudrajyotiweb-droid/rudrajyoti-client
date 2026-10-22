"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Flower2, Gift, Quote, ShoppingBag, Smartphone, BadgeCheck, Bell, WifiOff, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BrandMark, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal, RevealItem, Stagger } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/misc";
import { site } from "@/data/site";
import { useSite } from "@/lib/site";
import type { Review } from "@/lib/types";
import { initials } from "@/lib/utils";

const timeAgo = (iso: string) => {
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (d < 1) return "Today";
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  if (d < 30) return `${Math.floor(d / 7)} week${d >= 14 ? "s" : ""} ago`;
  if (d < 365) return `${Math.floor(d / 30)} month${d >= 60 ? "s" : ""} ago`;
  return `${Math.floor(d / 365)} year${d >= 730 ? "s" : ""} ago`;
};

function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setV(value);
    const c = animate(0, value, { duration: 2, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, value, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function StatsStrip() {
  // trust numbers from Admin → Settings (BRD §6.2.3)
  const { stats: st } = useSite();
  const stats = [
    { value: st.pujas, suffix: "+", label: "Pujas performed" },
    { value: st.devotees, suffix: "+", label: "Devotees served" },
    { value: st.temples, suffix: "", label: "Partner temples" },
    { value: st.rating, suffix: "★", label: "Average rating", decimals: 1 },
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark py-12 text-white md:py-16">
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 animate-spin-slow opacity-10" style={{ backgroundImage: "url(/assets/patterns/mandala.svg)", backgroundSize: "contain", filter: "brightness(0) invert(1)" }} />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 animate-spin-slow opacity-10" style={{ backgroundImage: "url(/assets/patterns/mandala.svg)", backgroundSize: "contain", filter: "brightness(0) invert(1)" }} />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 md:grid-cols-4 md:px-6">
        {stats.map((s, k) => (
          <Reveal key={s.label} delay={k * 0.1} className="text-center">
            <p className="font-serif text-4xl font-semibold md:text-5xl">
              <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-sm text-white/80">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { howItWorks } = useSite();
  return (
    <div className="relative">
      <svg className="absolute top-10 right-[12%] left-[12%] hidden h-2 md:block" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden="true">
        <motion.line x1="0" y1="1" x2="100" y2="1" stroke="#c9962b" strokeWidth="0.4" strokeDasharray="1.2 1.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: "easeInOut" }} />
      </svg>
      <Stagger className="grid gap-4 md:grid-cols-4 md:gap-6" gap={0.15}>
        {howItWorks.map((s, k) => (
          <RevealItem key={s.title}>
            <div className="group relative flex gap-4 rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] md:flex-col md:items-center md:bg-transparent md:p-0 md:text-center md:shadow-none md:border-0 md:hover:shadow-none">
              <div className="relative shrink-0">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-primary shadow-[var(--shadow-soft)] ring-1 ring-border transition-all duration-500 group-hover:bg-primary group-hover:text-white md:h-20 md:w-20">
                  <Icon name={s.icon} className="h-7 w-7 md:h-8 md:w-8" />
                </span>
                <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-[0.7rem] font-bold text-white ring-2 ring-bg">{k + 1}</span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold md:mt-4">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{s.desc}</p>
              </div>
            </div>
          </RevealItem>
        ))}
      </Stagger>
    </div>
  );
}

/** Approved reviews only (BRD §6.13) — demo reviews are hidden by the API in production. */
export function ReviewsRail({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white p-10 text-center">
        <p className="font-serif text-xl">Be the first to share your experience</p>
        <p className="mt-1 text-sm text-ink-muted">Reviews appear here after verified bookings.</p>
      </div>
    );
  }
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
      {reviews.slice(0, 8).map((r, k) => (
        <Reveal key={r.id} delay={k * 0.08} className="w-[82%] shrink-0 snap-center md:w-auto">
          <figure className="relative flex h-full flex-col rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
            <Stars value={r.rating} />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink">“{r.text}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-semibold text-white">{initials(r.name)}</span>
              <span className="text-sm">
                <b className="block">{r.name}</b>
                <span className="text-xs text-ink-muted">
                  {[r.city, timeAgo(r.date)].filter(Boolean).join(" · ")}
                </span>
              </span>
              <BadgeCheck className="ml-auto h-5 w-5 text-success" aria-label="Verified booking" />
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

export function AppInstallCta() {
  const appImage = useSite().pageImages.appInstall;
  const install = () => window.dispatchEvent(new Event("sm:install"));
  return (
    <Reveal>
      <div className="relative grid items-center gap-8 overflow-hidden rounded-3xl border border-border bg-white p-7 shadow-[var(--shadow-soft)] md:grid-cols-[1.2fr_1fr] md:p-12">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Smartphone className="h-3.5 w-3.5" /> PWA Ready
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight font-semibold md:text-4xl">
            Carry the temple <span className="text-primary">in your pocket</span>
          </h2>
          <p className="mt-3 max-w-md text-ink-muted">Add {site.name} to your home screen — it opens like an app, works offline and keeps you updated on every booking.</p>
          <ul className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {[
              [Zap, "Opens instantly"],
              [WifiOff, "Works offline"],
              [Bell, "Booking alerts"],
              [ShoppingBag, "Saved cart"],
            ].map(([I, t]) => {
              const C = I as typeof Zap;
              return (
                <li key={t as string} className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-bg text-primary">
                    <C className="h-4 w-4" />
                  </span>
                  {t as string}
                </li>
              );
            })}
          </ul>
          <Button onClick={install} className="mt-7">
            <Smartphone className="h-4 w-4" /> Add to Home Screen
          </Button>
        </div>
        <div className="relative mx-auto">
          <motion.div
            initial={{ y: 40, rotate: -6, opacity: 0 }}
            whileInView={{ y: 0, rotate: -6, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80 }}
            className="relative h-[380px] w-[200px] rounded-[2.2rem] border-[7px] border-ink bg-bg p-2 shadow-2xl"
          >
            <div className="absolute top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-ink" />
            <div className="mt-6 flex items-center gap-1.5 px-1">
              <BrandMark className="h-7 w-7" />
              <Wordmark className="h-3" />
            </div>
            <div className="relative mt-3 h-28 overflow-hidden rounded-xl">
              <Image src={appImage} alt="" fill sizes="200px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
              <p className="absolute top-3 left-3 font-serif text-sm leading-tight text-white">
                Book Your
                <br />
                Puja Online
              </p>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {[Flower2, ShoppingBag, Gift, Bell].map((I, k) => (
                <span key={k} className="grid h-9 place-items-center rounded-lg bg-white text-primary">
                  <I className="h-4 w-4" />
                </span>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {[0, 1].map((k) => (
                <div key={k} className="flex gap-2 rounded-lg bg-white p-1.5">
                  <span className="h-10 w-10 rounded-md bg-sand" />
                  <span className="flex-1 space-y-1 pt-1">
                    <span className="block h-2 w-3/4 rounded bg-sand" />
                    <span className="block h-2 w-1/2 rounded bg-primary/30" />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -right-6 bottom-10 grid h-16 w-16 place-items-center rounded-2xl bg-bg shadow-[var(--shadow-lift)] ring-1 ring-border"
          >
            <BrandMark className="h-12 w-12" />
          </motion.div>
        </div>
      </div>
    </Reveal>
  );
}
