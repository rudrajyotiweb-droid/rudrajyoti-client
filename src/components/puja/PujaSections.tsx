"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Check, ChevronDown, Headphones, Info, MapPin, Clock, ShieldCheck, Landmark, BadgeIndianRupee, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ReviewsRail } from "@/components/home/Sections";
import { Icon } from "@/components/ui/Icon";
import { Ornament } from "@/components/ui/Ornament";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/misc";
import { useIsClosed } from "@/components/ui/Countdown";
import { track } from "@/lib/api";
import type { PujaDetail as Puja, Review } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";

const TABS = [
  ["about", "About Puja"],
  ["benefits", "Benefits"],
  ["process", "Process"],
  ["temple", "Temple Details"],
  ["packages", "Packages"],
  ["reviews", "Reviews"],
  ["faqs", "FAQs"],
] as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="font-serif text-2xl font-semibold md:text-3xl">{children}</h2>
      <Ornament className="mt-1 -ml-1" />
    </div>
  );
}

/** Sticky tab nav with scroll-spy (BRD §6.4). */
function StickyTabs() {
  const [active, setActive] = useState<string>("about");
  const wrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // while a click-triggered smooth scroll runs, ignore scroll-spy so the pill doesn't flicker through every section
  const lockUntil = useRef(0);

  /** Distance from the viewport top to the bottom of the stuck tab bar. */
  const offset = () => {
    const el = wrapRef.current;
    if (!el) return 140;
    return parseFloat(getComputedStyle(el).top) + el.offsetHeight + 12;
  };

  // Scroll-spy: the active section is the last one whose top has passed the tab bar.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (Date.now() < lockUntil.current) return;
      // a section becomes active once its top reaches the upper part of the visible area below the bar
      const line = offset() + Math.min(160, window.innerHeight * 0.25);
      let current: string = TABS[0][0];
      for (const [id] of TABS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Keep the active pill visible inside the horizontal bar — scroll only the bar, never the page.
  useEffect(() => {
    const bar = barRef.current;
    const btn = bar?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!bar || !btn) return;
    bar.scrollTo({ left: btn.offsetLeft - bar.clientWidth / 2 + btn.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  const go = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setActive(id);
    lockUntil.current = Date.now() + 900;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset(), behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div ref={wrapRef} className="sticky top-16 z-30 -mx-4 border-y border-border bg-white/90 backdrop-blur-xl md:top-[4.1rem] md:mx-0 md:rounded-2xl md:border">
      <div ref={barRef} className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-2">
        {TABS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => go(e, id)}
            data-tab={id}
            className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors", active === id ? "text-white" : "text-ink-muted hover:text-primary")}
          >
            {active === id && <motion.span layoutId="puja-tab" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function About({ puja }: { puja: Puja }) {
  const [more, setMore] = useState(false);
  const items = more ? puja.about : puja.about.slice(0, 2);
  return (
    <section id="about" className="scroll-mt-36">
      <SectionTitle>About Puja</SectionTitle>
      <div className="relative space-y-5">
        <AnimatePresence initial={false}>
          {items.map((a) => (
            <motion.div key={a.q} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <h3 className="flex items-start gap-2 font-semibold">
                <span aria-hidden>🪔</span> {a.q}
              </h3>
              <p className="mt-1.5 pl-7 leading-relaxed text-ink-muted">{a.a}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {!more && puja.about.length > 2 && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg to-transparent" />}
      </div>
      {puja.about.length > 2 && (
        <button onClick={() => setMore(!more)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          {more ? "See Less" : "See More"} <ChevronDown className={cn("h-4 w-4 transition", more && "rotate-180")} />
        </button>
      )}
    </section>
  );
}

function Benefits({ puja }: { puja: Puja }) {
  return (
    <section id="benefits" className="scroll-mt-36">
      <SectionTitle>Puja Benefits</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-3">
        {puja.benefits.map((b, k) => (
          <Reveal key={b.title} delay={k * 0.08}>
            <div className="group h-full rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-soft to-[#fff1d6] text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Icon name={b.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{b.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Process({ puja }: { puja: Puja }) {
  return (
    <section id="process" className="scroll-mt-36">
      <SectionTitle>Puja Process</SectionTitle>
      <ol className="relative space-y-1">
        <motion.span
          className="absolute top-4 bottom-4 left-[1.15rem] w-0.5 origin-top bg-gradient-to-b from-primary via-accent to-primary/20"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
        {puja.process.map((s, k) => (
          <Reveal key={s.title} delay={k * 0.1} y={12}>
            <li className="relative flex gap-4 py-3">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-semibold text-primary shadow-[var(--shadow-soft)] ring-2 ring-primary">{k + 1}</span>
              <div className="pt-1.5">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-0.5 text-sm text-ink-muted">{s.desc}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function TempleDetails({ puja }: { puja: Puja }) {
  const t = puja.temple;
  if (!t) return null;
  return (
    <section id="temple" className="scroll-mt-36">
      <SectionTitle>Temple Details</SectionTitle>
      <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-soft)]">
        <div className="relative aspect-[16/8]">
          <Image src={t.image} alt={t.name} fill sizes="(max-width:768px) 100vw, 800px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-5 text-white">
            <h3 className="font-serif text-2xl font-semibold">{t.name}</h3>
            <p className="flex items-center gap-1 text-sm text-white/85">
              <MapPin className="h-3.5 w-3.5" /> {t.city}, {t.state}
            </p>
          </div>
        </div>
        <div className="p-5 md:p-6">
          <ul className="space-y-2.5">
            {t.history.map((h) => (
              <li key={h} className="flex gap-2 text-sm leading-relaxed text-ink-muted">
                <span aria-hidden>🔸</span> {h}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5">
              <Clock className="h-4 w-4 text-primary" /> {t.timings}
            </span>
            <Link href={`/temples/${t.slug}`} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              Explore temple <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Packages({ puja, selected, onSelect }: { puja: Puja; selected: string; onSelect: (id: string) => void }) {
  const pkgs = puja.packages;
  return (
    <section id="packages" className="scroll-mt-36">
      <SectionTitle>Select Puja Package</SectionTitle>
      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-[#fff7e6] to-white p-5">
        <p className="font-semibold">All packages include</p>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {["Name & gotra recited in the sankalp", "Guided mantras to chant from home", "Puja video shared on WhatsApp", "Free Aashirwad Box on opt-in"].map((x) => (
            <li key={x} className="flex items-start gap-2">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success text-white">
                <Check className="h-3 w-3" />
              </span>
              {x}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 flex items-start gap-2 rounded-xl bg-primary-soft/60 px-4 py-3 text-sm text-ink">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Add-on offerings like Deep Daan, Anna Daan and Gau Seva can be added before payment.
      </p>

      <div role="radiogroup" aria-label="Packages" className="mt-5 grid gap-4 sm:grid-cols-2">
        {pkgs.map((p) => {
          const on = selected === p.id;
          return (
            <motion.button
              key={p.id}
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(p.id)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex flex-col rounded-2xl border-2 bg-white p-5 text-left transition-all duration-300",
                on ? "border-primary shadow-[var(--shadow-glow)]" : "border-border hover:border-primary/40",
              )}
            >
              {p.popular && <span className="absolute -top-3 right-4 rounded-full bg-accent px-3 py-1 text-[0.65rem] font-bold tracking-wide text-white shadow">MOST POPULAR</span>}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-lg font-semibold">{p.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                    <Users className="h-3.5 w-3.5" /> {p.persons} {p.persons === 1 ? "person" : "persons"}
                  </p>
                </div>
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition", on ? "border-primary bg-primary" : "border-border")}>
                  <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="h-2 w-2 rounded-full bg-white" />}</AnimatePresence>
                </span>
              </div>
              <p className="mt-3 text-sm text-ink-muted">{p.desc}</p>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-primary">{formatINR(p.price)}</span>
                {p.strike && <span className="text-sm text-ink-muted line-through">{formatINR(p.strike)}</span>}
              </p>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          [BadgeIndianRupee, "Money-back guarantee"],
          [ShieldCheck, "No hidden cost"],
          [Landmark, "Official temple partner"],
          [Headphones, "Customer support"],
        ].map(([I, t]) => {
          const C = I as typeof ShieldCheck;
          return (
            <div key={t as string} className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-xs font-medium">
              <C className="h-4 w-4 shrink-0 text-success" /> {t as string}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Reviews({ reviews }: { reviews: Review[] }) {
  const avg = reviews.length ? reviews.reduce((t, r) => t + r.rating, 0) / reviews.length : 0;
  return (
    <section id="reviews" className="scroll-mt-36">
      <SectionTitle>Reviews &amp; Ratings</SectionTitle>
      {reviews.length > 0 && (
        <div className="mb-5 flex items-center gap-4 rounded-2xl border border-border bg-white p-5">
          <p className="font-serif text-4xl font-semibold text-primary">{avg.toFixed(1)}</p>
          <div className="text-sm">
            <p className="font-semibold">{avg >= 4.5 ? "Excellent" : avg >= 4 ? "Very good" : "Good"}</p>
            <p className="text-ink-muted">Based on {reviews.length} verified {reviews.length === 1 ? "review" : "reviews"}</p>
          </div>
          <BadgeCheck className="ml-auto h-8 w-8 text-success" />
        </div>
      )}
      <div className="[&>div]:md:grid-cols-2">
        <ReviewsRail reviews={reviews} />
      </div>
    </section>
  );
}

/** Everything below the fold on the puja detail page. */
export function PujaSections({ puja, globalFaqs = [] }: { puja: Puja; globalFaqs?: { q: string; a: string }[] }) {
  const pkgs = puja.packages;
  const [selected, setSelected] = useState(pkgs.find((p) => p.popular)?.id ?? pkgs[0]?.id ?? "");
  const pkg = pkgs.find((p) => p.id === selected) ?? pkgs[0];
  const router = useRouter();
  const closed = useIsClosed(puja.cutoff) || !puja.bookingOpen || !pkg;
  useEffect(() => track("puja_view"), []);
  const proceed = () => {
    if (closed) return;
    track("package_selected");
    router.push(`/puja/${puja.slug}/book?pkg=${selected}`);
  };
  if (!pkg) return null;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <StickyTabs />
            <div className="mt-8 space-y-14">
              <About puja={puja} />
              <Benefits puja={puja} />
              <Process puja={puja} />
              <TempleDetails puja={puja} />
              <Packages puja={puja} selected={selected} onSelect={setSelected} />
              <Reviews reviews={puja.reviews} />
              <section id="faqs" className="scroll-mt-36">
                <SectionTitle>Frequently Asked Questions</SectionTitle>
                <Accordion items={[...(puja.faqs ?? []), ...globalFaqs]} />
              </section>
            </div>
          </div>

          {/* Desktop sticky summary */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-lift)]">
              <div className="bg-gradient-to-br from-primary to-primary-dark p-5 text-white">
                <p className="text-xs tracking-wider text-white/75 uppercase">Selected package</p>
                <AnimatePresence mode="wait">
                  <motion.p key={pkg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-1 font-serif text-xl">
                    {pkg.name}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="p-5">
                <p className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary">{formatINR(pkg.price)}</span>
                  {pkg.strike && <span className="text-sm text-ink-muted line-through">{formatINR(pkg.strike)}</span>}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  For {pkg.persons} {pkg.persons === 1 ? "person" : "persons"} · incl. all taxes
                </p>
                <button
                  onClick={proceed}
                  disabled={closed}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-white shadow-[var(--shadow-glow)] transition hover:bg-primary-dark disabled:opacity-50"
                >
                  {closed ? "Booking Closed" : "Proceed to Book"} <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#packages" className="mt-3 block text-center text-sm font-medium text-primary hover:underline">
                  Change package
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="pb-safe fixed inset-x-0 bottom-[calc(3.6rem+var(--safe-bottom))] z-30 border-t border-border bg-white/95 px-4 pt-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3 pb-1">
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.p key={pkg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-lg font-semibold text-primary">
                {formatINR(pkg.price)}
              </motion.p>
            </AnimatePresence>
            <p className="truncate text-xs text-ink-muted">{pkg.name}</p>
          </div>
          <button
            onClick={proceed}
            disabled={closed}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-white shadow-[var(--shadow-glow)] active:scale-95 disabled:opacity-50"
          >
            {closed ? "Booking Closed" : "Proceed"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
