import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  hrefLabel = "View All",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const center = align === "center";
  return (
    <Reveal className={cn("mb-6 md:mb-10", center ? "text-center" : "flex items-end justify-between gap-4", className)}>
      <div className={cn(center && "mx-auto max-w-2xl")}>
        {eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>}
        <h2 className="text-2xl leading-tight font-semibold text-ink md:text-[2.4rem]">{title}</h2>
        <Ornament className={cn("mt-2", center ? "mx-auto" : "-ml-1")} />
        {subtitle && <p className="mt-3 text-sm text-ink-muted md:text-base">{subtitle}</p>}
      </div>
      {href && !center && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}
