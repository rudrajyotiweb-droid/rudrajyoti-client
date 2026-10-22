import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Ornament } from "@/components/ui/Ornament";
import { cn } from "@/lib/utils";

export function Breadcrumb({ items, light }: { items: [string, string?][]; light?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1 text-xs", light ? "text-white/80" : "text-ink-muted")}>
      {items.map(([label, href], i) => (
        <span key={label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}
          {href ? (
            <Link href={href} className={cn("hover:underline", light ? "hover:text-white" : "hover:text-primary")}>
              {label}
            </Link>
          ) : (
            <span className={light ? "text-white" : "text-ink"}>{label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Banner used at the top of listing pages. */
export function PageHeader({
  title,
  subtitle,
  image,
  crumbs,
  children,
}: {
  title: string;
  subtitle?: string;
  image: string;
  crumbs: [string, string?][];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <Image src={image} alt="" fill priority sizes="100vw" className="animate-[page-in_1.2s_ease-out_both] object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2a0606]/92 via-[#3b0b0b]/75 to-[#3b0b0b]/30" />
      <div
        className="pointer-events-none absolute -right-24 -bottom-40 h-96 w-96 animate-spin-slow opacity-10"
        style={{ backgroundImage: "url(/assets/patterns/mandala.svg)", backgroundSize: "contain", filter: "brightness(0) invert(1)" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10 text-white md:px-6 md:py-16">
        <Breadcrumb items={crumbs} light />
        <h1 className="mt-3 font-serif text-3xl leading-tight font-semibold md:text-5xl">{title}</h1>
        <Ornament className="mt-2 -ml-1 text-amber-300" />
        {subtitle && <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
