import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/cards/ProductCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { StoreListing } from "@/components/store/StoreListing";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealItem, Stagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { serverGet, serverTry } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import type { BannerT, Category, Product } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop Puja Samagri, Rudraksha & Idols",
  description: "Authentic puja samagri, rudraksha, yantras, brass idols and prasad — sourced from temple towns.",
};

export default async function StorePage() {
  let categories: Category[], products: Product[];
  try {
    [categories, products] = await Promise.all([serverGet<Category[]>("/categories").then((x) => x ?? []), serverGet<Product[]>("/products?limit=200").then((x) => x ?? [])]);
  } catch {
    return <ServiceUnavailable title="The shop could not be loaded" />;
  }
  const roots = categories.filter((c) => !c.parent);
  const [settings, banners] = await Promise.all([getSettings(), serverTry<BannerT[]>("/banners?placement=Store", [])]);
  const promo = banners[0]; // Banners → Store (first live one)
  return (
    <>
      <PageHeader
        title="Shop"
        subtitle="Authentic products for your spiritual journey — sourced from temple towns, energised with mantras."
        image={settings.pageImages.store}
        crumbs={[["Home", "/"], ["Shop"]]}
      />

      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12">
        <Stagger className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-8 md:overflow-visible md:px-0">
          {roots.map((c) => (
            <RevealItem key={c.slug} className="shrink-0">
              <Link href={`/store/category/${c.slug}`} className="group flex w-20 flex-col items-center gap-2 text-center md:w-auto">
                <span className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-border ring-offset-2 ring-offset-bg transition-all duration-500 group-hover:ring-primary md:h-24 md:w-24">
                  <Image src={c.image} alt="" fill sizes="96px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </span>
                <span className="text-xs leading-tight font-medium group-hover:text-primary">{c.name}</span>
              </Link>
            </RevealItem>
          ))}
        </Stagger>
      </section>

      {promo && (
      <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#fff1d6] to-primary-soft">
            <div className="grid items-center md:grid-cols-[1.2fr_1fr]">
              <div className="p-6 md:p-10">
                {promo.tagline && <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{promo.tagline}</p>}
                <h2 className="mt-2 font-serif text-2xl font-semibold md:text-4xl">{promo.title}</h2>
                {promo.subtitle && <p className="mt-2 text-sm text-ink-muted md:text-base">{promo.subtitle}</p>}
                <ButtonLink href={promo.link || "/store"} className="mt-5">
                  Shop the kit <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
              <div className="relative h-48 md:h-full md:min-h-[260px]">
                <Image src={promo.image} alt={promo.title} fill sizes="500px" className="object-cover md:[mask-image:linear-gradient(to_right,transparent,black_35%)]" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-12 md:px-6">
        <SectionHeading title="Best Sellers" />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:px-0">
          {products
            .filter((p) => p.bestseller)
            .map((p) => (
              <div key={p.slug} className="w-[46%] shrink-0 md:w-auto">
                <ProductCard product={p} />
              </div>
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 md:px-6">
        <SectionHeading title="All Products" />
        <StoreListing products={products} categories={categories} />
      </section>
    </>
  );
}
