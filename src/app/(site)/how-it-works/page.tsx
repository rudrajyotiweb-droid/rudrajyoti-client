import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "How Puja Seva Works" };
export const revalidate = 120;

/** Steps, images and bullet points come from Admin → Settings → Website content. */
export default async function HowItWorksPage() {
  const { howItWorks, pageImages } = await getSettings();
  return (
    <>
      <PageHeader title="How Puja Seva Works" subtitle="From choosing your puja to receiving the Aashirwad Box — every step is transparent." image={pageImages.howItWorks} crumbs={[["Home", "/"], ["How it works"]]} />
      <div className="mx-auto max-w-6xl space-y-16 px-4 pt-14 md:space-y-24 md:px-6">
        {howItWorks.map((s, i) => (
          <Reveal key={s.title}>
            <div className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
                <Image src={s.image || pageImages.howItWorks} alt="" fill sizes="(max-width:768px) 100vw, 560px" className="object-cover" />
                <span className="absolute top-4 left-4 grid h-14 w-14 place-items-center rounded-2xl bg-white font-serif text-2xl font-semibold text-primary shadow-lg">{i + 1}</span>
              </div>
              <div>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon name={s.icon} className="h-7 w-7" />
                </span>
                <h2 className="mt-5 font-serif text-3xl font-semibold md:text-4xl">{s.title}</h2>
                <p className="mt-3 text-lg leading-relaxed text-ink-muted">{s.desc}</p>
                <ul className="mt-5 space-y-2">
                  {s.points.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-success text-white">
                        <Check className="h-3 w-3" />
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
        <div className="text-center">
          <ButtonLink href="/puja" size="lg">
            Book your puja <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
