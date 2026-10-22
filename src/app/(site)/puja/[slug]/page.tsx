import { ArrowDown, BookOpen, CalendarDays, Gift, MapPin, ScrollText, Video } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PujaCard } from "@/components/cards/PujaCard";
import { Breadcrumb } from "@/components/layout/PageHeader";
import { Gallery } from "@/components/puja/Gallery";
import { PujaSections } from "@/components/puja/PujaSections";
import { Countdown } from "@/components/ui/Countdown";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IstDate } from "@/components/ui/IstDate";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { site } from "@/data/site";
import { getFaqs } from "@/lib/settings";
import { deityImages } from "@/data/taxonomy";
import { serverGet, serverTry } from "@/lib/api";
import type { PujaCardT, PujaDetail } from "@/lib/types";

export const revalidate = 60;
export const dynamicParams = true;

/** Pre-render live pujas at build; new ones render on first visit (ISR). */
export async function generateStaticParams() {
  const list = await serverTry<PujaCardT[]>("/pujas?limit=100", []);
  return list.map((p) => ({ slug: p.slug }));
}

const load = (slug: string) => serverGet<PujaDetail>(`/pujas/${encodeURIComponent(slug)}`);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug).catch(() => null);
  if (!p) return {};
  return { title: p.title, description: `${p.subtitle}. Book online in your name & gotra.`, openGraph: { images: [p.images[0]] } };
}

const promises = [
  { icon: Video, title: "Get Puja Video", desc: "On WhatsApp within 2 days" },
  { icon: ScrollText, title: "Proper Rituals", desc: "By temple pandits" },
  { icon: BookOpen, title: "Mantra for Chanting", desc: "Sent before puja day" },
  { icon: Gift, title: "Aashirwad Box", desc: "At your doorstep" },
];

export default async function PujaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  let puja: PujaDetail | null;
  try {
    puja = await load((await params).slug);
  } catch {
    return <ServiceUnavailable />;
  }
  if (!puja) notFound();
  const temple = puja.temple;
  const globalFaqs = (await getFaqs()).filter((f) => f.group !== "Store");
  const related = puja.related.slice(0, 3);
  const avatars = Object.values(deityImages).slice(0, 4);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: puja.title,
      description: puja.subtitle,
      startDate: puja.date,
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: temple ? { "@type": "Place", name: temple.name, address: `${temple.city}, ${temple.state}, India` } : undefined,
      image: puja.images,
      organizer: { "@type": "Organization", name: site.name },
      offers: puja.packages.map((pk) => ({ "@type": "Offer", name: pk.name, price: pk.price, priceCurrency: "INR", availability: puja.bookingOpen ? "https://schema.org/InStock" : "https://schema.org/SoldOut" })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [...puja.faqs, ...globalFaqs].map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="pb-36 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="mx-auto max-w-7xl px-4 pt-4 md:px-6 md:pt-8">
        <Breadcrumb items={[["Home", "/"], ["Puja Seva", "/puja"], [puja.title]]} />
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <Gallery images={puja.images} alt={puja.title} ribbon={puja.ribbon} />

          <div>
            <h1 className="font-serif text-[1.9rem] leading-tight font-semibold md:text-[2.6rem]">{puja.title}</h1>
            <p className="mt-2 text-lg text-primary">{puja.subtitle}</p>

            <div className="mt-5 space-y-2.5 text-sm">
              <p className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="pt-1.5">{temple ? `${temple.name}, ${temple.city}, ${temple.state}` : "Temple to be announced"}</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <span className="pt-1.5">
                  <IstDate iso={puja.date} />, {puja.tithi}
                </span>
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-white to-bg-alt p-4 md:p-5">
              <p className="mb-3 text-sm font-medium text-ink-muted">Puja booking will close in</p>
              <Countdown to={puja.cutoff} />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {avatars.map((a) => (
                  <span key={a} className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-bg">
                    <Image src={a} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-sm">
                <b className="text-primary">{puja.devotees.toLocaleString("en-IN")}+</b> devotees have participated
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {promises.map(({ icon: I, title, desc }, k) => (
                <Reveal key={title} delay={0.1 + k * 0.06}>
                  <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-white p-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <I className="h-5 w-5" />
                    </span>
                    <span className="text-sm leading-tight">
                      <b className="block">{title}</b>
                      <span className="text-xs text-ink-muted">{desc}</span>
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>

            <a
              href="#packages"
              className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-medium text-white shadow-[var(--shadow-glow)] transition hover:bg-primary-dark"
            >
              Select Puja Package <ArrowDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      <div className="mt-10">
        <PujaSections puja={puja} globalFaqs={globalFaqs} />
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6">
          <SectionHeading title="You may also like" href="/puja" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PujaCard key={p.slug} puja={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
