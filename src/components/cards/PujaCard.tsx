import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MiniCountdown } from "@/components/ui/Countdown";
import type { PujaCardT as Puja } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { IstDate } from "@/components/ui/IstDate";

/** Listing card per BRD §6.3. */
export function PujaCard({ puja, className, priority }: { puja: Puja; className?: string; priority?: boolean }) {
  return (
    <Link
      href={`/puja/${puja.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={puja.images[0]}
          alt={puja.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 90vw, 400px"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
        {puja.ribbon && (
          <span className="absolute top-3 left-0 rounded-r-full bg-primary py-1 pr-3 pl-3 text-[0.62rem] font-bold tracking-wider text-white shadow-lg">
            {puja.ribbon}
          </span>
        )}
        <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[0.7rem] font-medium text-primary backdrop-blur">
          <Clock className="h-3 w-3" /> {puja.bookingOpen ? <>Closes in <MiniCountdown to={puja.cutoff} /></> : "Booking closed"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="font-serif text-lg leading-snug font-semibold text-ink transition-colors group-hover:text-primary">{puja.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{puja.subtitle}</p>
        <div className="mt-3 space-y-1.5 text-[0.8rem] text-ink">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="line-clamp-1">
              {puja.temple?.name}, {puja.temple?.city}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="line-clamp-1">
              <IstDate iso={puja.date} opts={{ weekday: "short", day: "numeric", month: "short" }} /> · {puja.tithi}
            </span>
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[0.65rem] tracking-wide text-ink-muted uppercase">Starting from</p>
            <p className="text-xl font-semibold text-primary">{formatINR(puja.startingPrice)}</p>
          </div>
          <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold tracking-wide text-white shadow-[var(--shadow-glow)] transition-all group-hover:gap-2.5 group-hover:bg-primary-dark">
            PARTICIPATE <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Compact deity card used in "Popular Puja Services" (matches the client mock). */
export function DeityPujaCard({ puja, image }: { puja: Puja; image: string }) {
  return (
    <Link
      href={`/puja/${puja.slug}`}
      className="group relative flex h-full flex-col items-center overflow-hidden rounded-[var(--radius-card)] border border-border bg-white px-4 pt-6 pb-5 text-center shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]"
    >
      <span className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-soft/80 to-transparent" />
      <div className="relative">
        <span className="absolute -inset-2 rounded-full border border-dashed border-accent/60 transition-transform duration-[2s] group-hover:rotate-180" />
        <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-white shadow-lg md:h-32 md:w-32">
          <Image src={image} alt={puja.deity} fill sizes="128px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
      </div>
      <h3 className="relative mt-5 font-serif text-[1.02rem] leading-snug font-semibold">{puja.title.split("&")[0].trim()}</h3>
      <p className="relative mt-1 text-xs text-ink-muted">{puja.subtitle.replace(/^For /, "For ").split(",")[0]}</p>
      <p className="relative mt-2 text-sm font-semibold text-primary">from {formatINR(puja.startingPrice)}</p>
      <span className="relative mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-white transition-all group-hover:gap-2.5 group-hover:bg-primary-dark">
        Book Now <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

/** Horizontal list row used on mobile listing (matches the "Book a Puja" mock screen). */
export function PujaRow({ puja }: { puja: Puja }) {
  return (
    <Link href={`/puja/${puja.slug}`} className="group flex gap-3 rounded-2xl border border-border bg-white p-3 shadow-[var(--shadow-soft)] transition active:scale-[0.98]">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
        <Image src={puja.images[0]} alt="" fill sizes="96px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="line-clamp-1 font-semibold">{puja.title}</p>
        <p className="line-clamp-1 text-xs text-ink-muted">{puja.subtitle}</p>
        <p className="mt-1 flex items-center gap-1 text-[0.7rem] text-ink-muted">
          <Clock className="h-3 w-3" /> <MiniCountdown to={puja.cutoff} />
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-semibold text-primary">{formatINR(puja.startingPrice)}</span>
          <span className="rounded-full bg-primary px-3 py-1.5 text-[0.7rem] font-semibold text-white">Book Now</span>
        </div>
      </div>
    </Link>
  );
}
