import { HandHeart, Landmark, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { StatsStrip } from "@/components/home/Sections";
import { PageHeader } from "@/components/layout/PageHeader";
import { Ornament } from "@/components/ui/Ornament";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "About Us" };

const values = [
  [Landmark, "Rooted in tradition", "Every puja follows the vidhi of its temple, performed by the pandits who serve there."],
  [ShieldCheck, "Transparent by design", "Your name in the sankalp, a video of the puja and a full refund if it cannot be performed."],
  [HandHeart, "Seva first", "A part of every booking supports anna daan and gau seva at partner temples."],
  [Sparkles, "Authentic products", "Samagri and spiritual products sourced from temple towns and trusted artisans."],
] as const;

export default async function AboutPage() {
  const { pageImages } = await getSettings();
  return (
    <>
      <PageHeader title={`About ${site.name}`} subtitle="Bringing the blessings of India's sacred temples to every home." image={pageImages.about} crumbs={[["Home", "/"], ["About"]]} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 md:grid-cols-2 md:px-6">
        <Reveal>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Bhakti, Seva <span className="text-primary">&amp; Sanskar</span>
          </h2>
          <Ornament className="mt-2 -ml-1" />
          <p className="mt-5 leading-relaxed text-ink-muted">
            Millions of devotees wish to offer prayers at Kashi, Kamakhya, Tarapith or Mahakal but cannot travel — because of age, health, work or distance. {site.name} was started so that every devotee can take part in these pujas, in their own name and gotra, from wherever they are.
          </p>
          <p className="mt-4 leading-relaxed text-ink-muted">
            We partner directly with temple pandits, share a video of every puja, and deliver blessed prasad to your doorstep. Our store brings genuine puja samagri and spiritual products from the places they belong to.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-[var(--shadow-lift)]">
            <Image src={pageImages.aboutStory} alt="Aarti at the ghats" fill sizes="500px" className="object-cover" />
          </div>
        </Reveal>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(([I, t, d], k) => (
            <Reveal key={t} delay={k * 0.06}>
              <div className="h-full rounded-3xl border border-border bg-white p-6">
                <I className="h-8 w-8 text-primary" />
                <p className="mt-4 font-serif text-lg font-semibold">{t}</p>
                <p className="mt-1 text-sm text-ink-muted">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <StatsStrip />
      <section className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 px-4 pt-14 text-sm md:px-6">
        {[
          ["Privacy policy", "/pages/privacy"],
          ["Terms of use", "/pages/terms"],
          ["Refund policy", "/pages/refund"],
          ["Shipping policy", "/pages/shipping"],
        ].map(([t, h]) => (
          <a key={h} href={h} className="font-medium text-primary hover:underline">
            {t}
          </a>
        ))}
      </section>
    </>
  );
}
