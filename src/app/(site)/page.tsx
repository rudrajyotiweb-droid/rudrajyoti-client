import { Fragment } from "react";
import { ChadhavaCard } from "@/components/cards/TempleCard";
import { AppInstallCta, ReviewsRail } from "@/components/home/Sections";
import { FamousTemples, HomeHero, PromoCarousel, QuickCategories, RailHeading, SpiritualProducts, UpcomingTithiPujas, WhyChoose } from "@/components/home/HomeSections";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { Reveal } from "@/components/ui/Reveal";
import { serverGet } from "@/lib/api";
import type { HomeData, HomeSection, SectionId } from "@/lib/types";

export const revalidate = 60;

/** Order and visibility come from Admin → Home Page. */
const blocks: Record<SectionId, (s: HomeSection, d: HomeData) => React.ReactNode> = {
  quick: (_s, d) => <QuickCategories links={d.quickLinks} />,
  promo: (_s, d) => (d.promos.length ? <PromoCarousel promos={d.promos} pujas={d.upcomingPujas} /> : null),
  upcoming: (s, d) => <UpcomingTithiPujas section={s} pujas={d.upcomingPujas} />,
  temples: (s, d) => <FamousTemples section={s} temples={d.temples} />,
  products: (s, d) => <SpiritualProducts section={s} tiles={d.productTiles} />,
  chadhava: (s, d) =>
    d.chadhavas.length ? (
      <section className="mx-auto max-w-7xl px-3 pt-6 md:px-6 md:pt-14">
        <RailHeading title={s.title} href={s.link} />
        <div className="no-scrollbar -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
          {d.chadhavas.map((c, k) => (
            <Reveal key={c.slug} delay={k * 0.06} className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto">
              <ChadhavaCard c={c} />
            </Reveal>
          ))}
        </div>
      </section>
    ) : null,
  why: (s, d) => <WhyChoose section={s} why={d.why} />,
  reviews: (s, d) => (
    <section className="mx-auto max-w-7xl px-3 pt-8 md:px-6 md:pt-16">
      <RailHeading title={s.title} />
      <ReviewsRail reviews={d.reviews} />
    </section>
  ),
  app: () => (
    <section className="mx-auto max-w-7xl px-3 pt-8 md:px-6 md:pt-16">
      <AppInstallCta />
    </section>
  ),
};

export default async function HomePage() {
  let data: HomeData | null = null;
  try {
    data = await serverGet<HomeData>("/home", { revalidate: 60 });
  } catch {
    data = null;
  }
  if (!data) return <ServiceUnavailable />;

  return (
    <>
      <HomeHero hero={data.hero} heroSlides={data.heroSlides} />
      {(data.sections ?? [])
        .filter((s) => s.visible && blocks[s.id])
        .map((s) => (
          <Fragment key={s.id}>{blocks[s.id](s, data)}</Fragment>
        ))}
    </>
  );
}
