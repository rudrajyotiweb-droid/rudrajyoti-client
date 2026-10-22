import type { Metadata } from "next";
import { ChadhavaCard } from "@/components/cards/TempleCard";
import { HowItWorks } from "@/components/home/Sections";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { serverTry } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import type { ChadhavaCardT } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Chadhava — Offerings at Sacred Temples",
  description: "Offer flowers, diyas, chunri and bhog at famous temples in your name. Get the offering video on WhatsApp.",
};

export default async function ChadhavaPage() {
  const [chadhavas, settings] = await Promise.all([serverTry<ChadhavaCardT[]>("/chadhava", []), getSettings()]);
  return (
    <>
      <PageHeader
        title="Chadhava"
        subtitle="Offer flowers, diyas, chunri and bhog to the deity at famous temples — in your name and gotra, with a video of the offering on WhatsApp."
        image={settings.pageImages.chadhava}
        crumbs={[["Home", "/"], ["Chadhava"]]}
      />
      <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        {chadhavas.length === 0 && <p className="rounded-3xl border border-dashed border-border bg-white p-10 text-center text-ink-muted">New chadhava offerings will be announced soon.</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {chadhavas.map((c, k) => (
            <Reveal key={c.slug} delay={k * 0.06}>
              <ChadhavaCard c={c} />
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6">
        <SectionHeading align="center" title="How Chadhava Works" />
        <HowItWorks />
      </section>
    </>
  );
}
