import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { Breadcrumb } from "@/components/layout/PageHeader";
import { ProductDetail } from "@/components/store/ProductDetail";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { site } from "@/data/site";
import { serverGet, serverTry } from "@/lib/api";
import type { Category, Product, ProductDetailT } from "@/lib/types";

export const revalidate = 30;
export const dynamicParams = true;

export async function generateStaticParams() {
  const list = await serverTry<Product[]>("/products?limit=200", []);
  return list.map((p) => ({ slug: p.slug }));
}

const load = (slug: string) => serverGet<ProductDetailT>(`/products/${encodeURIComponent(slug)}`, { revalidate: 30 });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug).catch(() => null);
  if (!p) return {};
  return { title: p.name, description: p.short, openGraph: { images: [p.images[0]] } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  let p: ProductDetailT | null;
  try {
    p = await load((await params).slug);
  } catch {
    return <ServiceUnavailable />;
  }
  if (!p) notFound();
  const cat = (await serverTry<Category[]>("/categories", [])).find((c) => c.slug === p.category);
  const related = p.related.slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images,
    description: p.description,
    brand: { "@type": "Brand", name: site.name },
    offers: { "@type": "Offer", price: p.price, priceCurrency: "INR", availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };
  return (
    <div className="pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6 md:pt-8">
        <Breadcrumb items={[["Home", "/"], ["Shop", "/store"], [cat?.name ?? "", `/store/category/${p.category}`], [p.name]]} />
      </div>
      <ProductDetail product={p} />
      {related.length > 0 && (
      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6">
        <SectionHeading title="You may also like" href="/store" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {related.map((r) => (
            <ProductCard key={r.slug} product={r} />
          ))}
        </div>
      </section>
      )}
    </div>
  );
}
