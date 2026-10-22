"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { IstDate } from "@/components/ui/IstDate";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { useSite } from "@/lib/site";
import type { HomeData, HomeSection, PujaCardT as Puja } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";


function useAutoSlide(count: number, ms: number) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || count < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % count), ms);
    return () => clearInterval(id);
  }, [count, ms, reduce, i]);
  return [i, setI] as const;
}

function Dots({ count, active, onPick, className }: { count: number; active: number; onPick: (k: number) => void; className?: string }) {
  return (
    <div className={cn("flex gap-1.5", className)}>
      {Array.from({ length: count }, (_, k) => (
        <button
          key={k}
          type="button"
          aria-label={`Slide ${k + 1}`}
          aria-current={k === active}
          onClick={() => onPick(k)}
          className={cn("h-2 rounded-full transition-all duration-500", k === active ? "w-5 bg-white" : "w-2 bg-white/45 hover:bg-white/70")}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

export function HomeHero({ hero, heroSlides }: Pick<HomeData, "hero" | "heroSlides">) {
  const [i, setI] = useAutoSlide(heroSlides.length, 5500);
  const slide = heroSlides[i] ?? heroSlides[0];
  const deity = useSite().pageImages.heroDeity;
  return (
    <section className="relative isolate overflow-hidden bg-primary-dark text-white">
      <AnimatePresence initial={false}>
        {slide && <motion.div key={i} className="absolute inset-0 -z-10" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: "linear" } }}>
          <Image src={slide.image} alt={slide.caption} fill priority={i === 0} sizes="100vw" className="object-cover" />
        </motion.div>}
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2a0606]/90 via-[#2a0606]/55 to-transparent" />

      {/* Shiva medallion on the right, echoing the mock */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute top-1/2 -right-16 -z-10 h-64 w-64 -translate-y-1/2 sm:right-4 md:right-[6%] md:h-[26rem] md:w-[26rem]"
      >
        <span className="absolute -inset-4 animate-spin-slow rounded-full border border-dashed border-white/40" />
        <span className="relative block h-full w-full overflow-hidden rounded-full ring-2 ring-white/60">
          <Image src={deity} alt="" fill sizes="(max-width: 768px) 256px, 416px" className="object-cover opacity-70 md:opacity-90" />
        </span>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-14 md:px-6 md:pt-16 md:pb-24">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-[2.1rem] leading-[1.08] font-semibold drop-shadow md:text-6xl">
          {hero.line1} <br />
          <span className="text-amber-200">{hero.line2}</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-3 max-w-[19rem] text-sm leading-relaxed text-white/90 md:max-w-lg md:text-lg">
          {hero.text}
        </motion.p>

        <motion.ul initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-5 grid max-w-md grid-cols-4 gap-1 md:mt-8 md:max-w-xl md:gap-4">
          {hero.trust.slice(0, 4).map(({ icon, line1: a, line2: b }) => (
            <li key={a + b} className="flex flex-col items-center text-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-primary shadow-[var(--shadow-soft)] md:h-14 md:w-14">
                <Icon name={icon} className="h-5 w-5 md:h-6 md:w-6" />
              </span>
              <span className="mt-1.5 text-[0.62rem] leading-tight font-medium text-white/95 md:text-xs">
                {a}
                <br />
                {b}
              </span>
            </li>
          ))}
        </motion.ul>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <ButtonLink href={hero.ctaLink} size="lg" className="mt-6 md:mt-8">
            {hero.ctaLabel} <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </motion.div>
      </div>

      <Dots count={heroSlides.length} active={i} onPick={setI} className="absolute right-4 bottom-10 md:right-8 md:bottom-12" />
    </section>
  );
}

/* ───────────────────────── Quick categories ───────────────────────── */

export function QuickCategories({ links }: { links: HomeData["quickLinks"] }) {
  return (
    <div className="relative z-10 mx-auto -mt-6 max-w-7xl px-3 md:-mt-10 md:px-6">
      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-border bg-white p-3 shadow-[var(--shadow-lift)] md:grid md:grid-cols-7 md:gap-4 md:p-5">
        {links.slice(0, 7).map(({ link: href, title: en, sub, icon }, k) => (
          <motion.div key={en} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + k * 0.05 }} className="w-[4.9rem] shrink-0 md:w-auto">
            <Link href={href} className="group flex flex-col items-center text-center active:scale-95">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-primary group-hover:text-white md:h-16 md:w-16">
                <Icon name={icon} className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.9} />
              </span>
              <span className="mt-1.5 text-[0.68rem] leading-tight font-semibold text-ink md:text-sm">{en}</span>
              <span className="text-[0.62rem] leading-tight text-ink-muted md:text-xs">{sub}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Promo banner carousel ───────────────────────── */

export function PromoCarousel({ promos, pujas }: { promos: HomeData["promos"]; pujas: Puja[] }) {
  const [i, setI] = useAutoSlide(promos.length, 6000);
  const p = promos[i];
  const puja = p?.pujaSlug ? pujas.find((x) => x.slug === p.pujaSlug) : undefined;
  if (!p) return null;
  return (
    <section className="mx-auto max-w-7xl px-3 pt-5 md:px-6 md:pt-10">
      <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-[#b71c1c] via-primary-dark to-[#5e0d0d] shadow-[var(--shadow-lift)] sm:h-56 md:h-72">
        <AnimatePresence initial={false}>
          <motion.div key={i} className="absolute inset-y-0 right-0 w-[55%]" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <Image src={p.image} alt="" fill sizes="(max-width: 768px) 55vw, 700px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/40 to-transparent" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(/assets/patterns/mandala.svg)", backgroundSize: "240px", filter: "brightness(0) invert(1)" }} />

        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }} className="relative flex h-full max-w-[64%] flex-col justify-center p-4 md:max-w-[55%] md:p-10">
            <h2 className="font-serif text-2xl leading-tight font-bold text-amber-200 drop-shadow md:text-5xl">{p.title}</h2>
            <p className="mt-0.5 font-serif text-base font-semibold text-white md:text-2xl">{p.subtitle}</p>
            {puja && (
              <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/40 bg-white/10 px-2.5 py-1 text-xs font-medium text-white md:text-sm">
                <CalendarDays className="h-3.5 w-3.5" />
                <IstDate iso={puja.date} opts={{ weekday: undefined, year: "numeric" }} />
              </p>
            )}
            {p.tagline && <p className="mt-1.5 line-clamp-1 text-[0.7rem] text-white/85 md:text-base">{p.tagline}</p>}
            <ButtonLink href={p.link} variant="white" size="sm" className="mt-2.5 w-fit md:mt-4">
              Book Now <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </motion.div>
        </AnimatePresence>

        <Dots count={promos.length} active={i} onPick={setI} className="absolute bottom-2.5 left-1/2 -translate-x-1/2" />
      </div>
    </section>
  );
}

/* ───────────────────────── Rails ───────────────────────── */

export function RailHeading({ title, href }: { title: string; href?: string }) {
  return (
    <Reveal className="mb-3 flex items-end justify-between gap-3 md:mb-6">
      <h2 className="font-serif text-xl font-semibold text-ink md:text-3xl">{title}</h2>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark md:text-sm">
          View All <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}

const rail = "no-scrollbar -mx-3 flex snap-x gap-2.5 overflow-x-auto px-3 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0";

function TithiPujaCard({ puja }: { puja: Puja }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
      <Link href={`/puja/${puja.slug}`} className="group relative block aspect-[4/3] overflow-hidden">
        <Image src={puja.images[0]} alt={puja.title} fill sizes="(max-width: 768px) 45vw, 300px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
      </Link>
      <div className="flex flex-1 flex-col p-2.5 md:p-4">
        <h3 className="line-clamp-1 font-sans text-sm font-semibold md:text-base">{puja.title}</h3>
        <p className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-[0.65rem] text-ink-muted">from</span>
          <b className="text-lg text-primary md:text-xl">{formatINR(puja.startingPrice)}</b>
        </p>
        <Link
          href={`/puja/${puja.slug}/book`}
          className="mt-auto block rounded-full bg-primary py-1.5 text-center text-xs font-semibold text-white transition hover:bg-primary-dark active:scale-95 md:py-2 md:text-sm"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

export function UpcomingTithiPujas({ section: { title, link }, pujas: upcoming }: { section: HomeSection; pujas: Puja[] }) {
  if (!upcoming.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-3 pt-6 md:px-6 md:pt-14">
      <RailHeading title={title} href={link} />
      <div className={rail}>
        {upcoming.map((p, k) => (
          <Reveal key={p.slug} delay={(k % 4) * 0.06} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto">
            <TithiPujaCard puja={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FamousTemples({ section: { title, link }, temples: list }: { section: HomeSection; temples: HomeData["temples"] }) {
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-3 pt-6 md:px-6 md:pt-14">
      <RailHeading title={title} href={link} />
      <div className={cn(rail, "md:grid-cols-4")}>
        {list.map((t, k) => {
          const [name, place] = [t.name, `${t.city}, ${t.state}`];
          return (
            <Reveal key={t.slug} delay={(k % 4) * 0.06} className={cn("w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto", k >= 4 && "md:hidden")}>
              <Link href={`/temples/${t.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-[var(--shadow-soft)]">
                  <Image src={t.image} alt={t.name} fill sizes="(max-width: 768px) 45vw, 300px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="relative mx-1.5 -mt-7 flex items-center gap-1.5 rounded-lg border border-border bg-white p-2 shadow-[var(--shadow-soft)] md:mx-3 md:p-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-sans text-sm font-semibold md:text-base">{name}</h3>
                    <p className="flex items-center gap-0.5 truncate text-[0.62rem] text-ink-muted md:text-xs">
                      <MapPin className="h-3 w-3 shrink-0 text-primary" /> {place}
                    </p>
                  </div>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white md:h-8 md:w-8">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export function SpiritualProducts({ section: { title, link }, tiles }: { section: HomeSection; tiles: HomeData["productTiles"] }) {
  const items = tiles.map((t) => ({ name: t.label, href: t.link, image: t.image, from: t.fromPrice }));
  return (
    <section className="mx-auto max-w-7xl px-3 pt-6 md:px-6 md:pt-14">
      <RailHeading title={title} href={link} />
      <div className={rail}>
        {items.map((it, k) => (
          <Reveal key={it.name} delay={(k % 4) * 0.06} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto">
            <Link href={it.href} className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={it.image} alt={it.name} fill sizes="(max-width: 768px) 45vw, 300px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="flex items-center gap-2 p-2.5 md:p-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-sans text-sm font-semibold md:text-base">{it.name}</h3>
                  {it.from != null && <p className="text-[0.68rem] font-semibold text-primary md:text-sm">From {formatINR(it.from)}</p>}
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-white shadow-md transition group-hover:scale-110 group-hover:bg-primary-dark md:h-10 md:w-10">
                  <ShoppingCart className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Why choose ───────────────────────── */

export function WhyChoose({ section: { title }, why }: { section: HomeSection; why: HomeData["why"] }) {
  return (
    <section className="mx-auto max-w-7xl px-3 pt-8 md:px-6 md:pt-16">
      <Reveal>
        <div className="mandala-bg overflow-hidden rounded-2xl border border-border bg-white px-3 py-5 shadow-[var(--shadow-soft)] md:px-8 md:py-10">
          <h2 className="text-center font-serif text-lg font-semibold text-ink md:text-3xl">{title}</h2>
          <ul className="mt-4 grid grid-cols-5 gap-1 md:mt-8 md:gap-6">
            {why.slice(0, 5).map(({ icon, line1: a, line2: b }, k) => (
              <motion.li key={a + b} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: k * 0.08 }} className="flex flex-col items-center text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary md:h-16 md:w-16">
                  <Icon name={icon} className="h-5 w-5 md:h-7 md:w-7" />
                </span>
                <span className="mt-1.5 text-[0.66rem] leading-tight font-medium text-ink md:text-sm">
                  {a}
                  <br />
                  {b}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
