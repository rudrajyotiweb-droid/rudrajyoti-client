import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/** Trident-and-lotus emblem cut from the brand logo (public/assets/brand). */
export function BrandMark({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/assets/brand/emblem-256.png"
      alt=""
      width={256}
      height={256}
      priority={priority}
      className={cn("h-10 w-10 shrink-0 object-contain", className)}
    />
  );
}

/** "RUDRA JYOTI" lettering from the logo; `light` uses the white version for dark backgrounds. */
export function Wordmark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Image
      src={light ? "/assets/brand/wordmark-white.png" : "/assets/brand/wordmark.png"}
      alt={site.name}
      width={1117}
      height={175}
      className={cn("h-auto w-auto object-contain object-left", className)}
    />
  );
}

export function Logo({ className, light = false, compact = false }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2", className)} aria-label={`${site.name} home`}>
      <BrandMark priority className={cn("transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg]", compact ? "h-10 w-10" : "h-12 w-12")} />
      <span className="flex flex-col leading-none">
        <Wordmark light={light} className={cn("transition-all duration-500", compact ? "h-[1.15rem]" : "h-[1.4rem]")} />
        <span className={cn("mt-1 block text-[0.6rem] tracking-[0.08em] whitespace-nowrap", light ? "text-white/80" : "text-ink-muted", compact && "text-[0.55rem]")}>
          {site.tagline}
        </span>
      </span>
    </Link>
  );
}
