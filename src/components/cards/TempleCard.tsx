import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ChadhavaCardT as Chadhava, TempleCardT as Temple } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { IstDate } from "@/components/ui/IstDate";

export function TempleCard({ temple, className }: { temple: Temple; className?: string }) {
  return (
    <Link
      href={`/temples/${temple.slug}`}
      className={cn("group relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]", className)}
    >
      <Image src={temple.image} alt={temple.name} fill sizes="(max-width: 768px) 70vw, 300px" className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <span className="absolute top-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-white/90 text-primary opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] backdrop-blur">{temple.deity}</span>
        <h3 className="mt-2 font-serif text-lg leading-tight font-semibold">{temple.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-white/80">
          <MapPin className="h-3 w-3" /> {temple.city}, {temple.state}
        </p>
      </div>
    </Link>
  );
}

export function ChadhavaCard({ c }: { c: Chadhava }) {
  const temple = c.temple;
  const from = c.startingPrice;
  return (
    <Link
      href={`/chadhava/${c.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={c.image} alt={c.title} fill sizes="(max-width: 768px) 90vw, 400px" className="object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 flex -space-x-2">
          {(c.items ?? []).slice(0, 4).map((i) => (
            <span key={i.id} className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white">
              <Image src={i.image} alt="" fill sizes="36px" className="object-cover" />
            </span>
          ))}
        </div>
        <span className="absolute right-3 bottom-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
          <IstDate iso={c.date} opts={{ weekday: undefined, day: "numeric", month: "short" }} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-semibold group-hover:text-primary">{c.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{c.subtitle}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-ink-muted">
          <MapPin className="h-3 w-3 text-primary" /> {temple?.name}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-sm">
            Offerings from <b className="text-primary">{formatINR(from)}</b>
          </span>
          <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">Offer Now</span>
        </div>
      </div>
    </Link>
  );
}
