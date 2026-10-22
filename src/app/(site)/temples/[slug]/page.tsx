import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PujaCard } from "@/components/cards/PujaCard";
import { ChadhavaCard } from "@/components/cards/TempleCard";
import { Breadcrumb } from "@/components/layout/PageHeader";
import { Ornament } from "@/components/ui/Ornament";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { serverGet, serverTry } from "@/lib/api";
import type { Temple, TempleDetail } from "@/lib/types";

export const revalidate = 120;
export const dynamicParams = true;

export async function generateStaticParams() {
  const list = await serverTry<Temple[]>("/temples", []);
  return list.map((t) => ({ slug: t.slug }));
}

const load = (slug: string) => serverGet<TempleDetail>(`/temples/${encodeURIComponent(slug)}`, { revalidate: 120 });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = await load((await params).slug).catch(() => null);
  return { title: t?.name ?? "Temple", description: t?.short };
}

export default async function TemplePage({ params }: { params: Promise<{ slug: string }> }) {
  let t: TempleDetail | null;
  try {
    t = await load((await params).slug);
  } catch {
    return <ServiceUnavailable />;
  }
  if (!t) notFound();
  const tp = t.pujas;
  const tc = t.chadhavas;

  return (
    <>
      <section className="relative h-[55vh] min-h-[320px] overflow-hidden">
        <Image src={t.image} alt={t.name} fill priority sizes="100vw" className="animate-[page-in_1.4s_ease-out_both] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d0505] via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 text-white md:px-6">
          <Breadcrumb light items={[["Home", "/"], ["Temples", "/temples"], [t.name]]} />
          <span className="mt-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">{t.deity}</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold md:text-6xl">{t.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-white/85">
            <MapPin className="h-4 w-4" /> {t.city}, {t.state}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-10 md:px-6 lg:grid-cols-[1fr_380px]">
        <Reveal>
          <h2 className="font-serif text-2xl font-semibold md:text-3xl">History &amp; significance</h2>
          <Ornament className="mt-1 -ml-1" />
          <p className="mt-4 text-lg text-ink">{t.short}</p>
          <ul className="mt-4 space-y-3">
            {t.history.map((h) => (
              <li key={h} className="flex gap-2 leading-relaxed text-ink-muted">
                <span aria-hidden>🔸</span> {h}
              </li>
            ))}
          </ul>
          {t.gallery.length > 1 && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {t.gallery.map((g) => (
                <div key={g} className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image src={g} alt="" fill sizes="200px" className="object-cover transition-transform duration-700 hover:scale-110" />
                </div>
              ))}
            </div>
          )}
        </Reveal>
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-white p-5">
            <p className="flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-primary" /> Darshan timings
            </p>
            <p className="mt-1 text-sm text-ink-muted">{t.timings}</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border bg-white">
            <iframe
              title={`Map of ${t.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(t.mapQuery)}&output=embed`}
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>
      </div>

      {tp.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 md:px-6">
          <SectionHeading title={`Upcoming pujas at ${t.city}`} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tp.map((p) => (
              <PujaCard key={p.slug} puja={p} />
            ))}
          </div>
        </section>
      )}
      {tc.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 md:px-6">
          <SectionHeading title="Chadhava at this temple" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tc.map((c) => (
              <ChadhavaCard key={c.slug} c={c} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
