import type { Metadata } from "next";
import { Suspense } from "react";
import { Gift, ScrollText, Video } from "lucide-react";
import { HowItWorks, ReviewsRail, StatsStrip } from "@/components/home/Sections";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { serverGet, serverTry } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import type { BannerT, PujaCardT, Review, Temple } from "@/lib/types";
import Link from "next/link";
import { PujaListing } from "./PujaListing";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Book Puja Online at Sacred Temples",
  description: "Book pujas at famous temples of India in your name and gotra. Get the puja video on WhatsApp and the Aashirwad Box at home.",
};

export default async function PujaPage() {
  let pujas: PujaCardT[] | null = null;
  try {
    pujas = await serverGet<PujaCardT[]>("/pujas?limit=100");
  } catch {
    pujas = null;
  }
  const [temples, reviews, settings, banners] = await Promise.all([
    serverTry<Temple[]>("/temples", []),
    serverTry<Review[]>("/reviews?kind=Puja&limit=8", []),
    getSettings(),
    serverTry<BannerT[]>("/banners?placement=Puja listing", []),
  ]);
  const strip = banners[0];
  return (
    <>
      <PageHeader
        title="Book a Puja"
        subtitle="Pujas performed at sacred temples of Bharat in your name & gotra — watch the video on WhatsApp and receive the Aashirwad Box at your doorstep."
        image={settings.pageImages.puja}
        crumbs={[["Home", "/"], ["Puja Seva"]]}
      >
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          {[
            [ScrollText, "Sankalp in your name & gotra"],
            [Video, "Puja video on WhatsApp"],
            [Gift, "Free Aashirwad Box"],
          ].map(([I, t]) => {
            const C = I as typeof Video;
            return (
              <span key={t as string} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                <C className="h-3.5 w-3.5 text-amber-200" /> {t as string}
              </span>
            );
          })}
        </div>
      </PageHeader>

      {/* Banners → Puja listing (first live one) */}
      {strip && (
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
          <Link href={strip.link || "/puja"} className="group relative block h-24 overflow-hidden rounded-2xl md:h-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={strip.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#2a0606]/90 via-[#2a0606]/50 to-transparent" />
            <span className="relative flex h-full flex-col justify-center px-5 text-white md:px-8">
              <b className="font-serif text-lg md:text-2xl">{strip.title}</b>
              {strip.subtitle && <span className="text-sm text-white/85">{strip.subtitle}</span>}
            </span>
          </Link>
        </div>
      )}

      {/* filters live in the URL (read on the client) */}
      {pujas ? (
        <Suspense fallback={<div className="mx-auto mt-10 h-96 max-w-7xl rounded-3xl px-4 skeleton" />}>
          <PujaListing pujas={pujas} temples={temples} />
        </Suspense>
      ) : (
        <ServiceUnavailable title="Pujas could not be loaded" />
      )}

      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6">
        <SectionHeading title="What devotees say" />
        <ReviewsRail reviews={reviews} />
      </section>
      <div className="mt-16">
        <StatsStrip />
      </div>
      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6">
        <SectionHeading align="center" title="How Puja Seva Works" />
        <HowItWorks />
      </section>
    </>
  );
}
