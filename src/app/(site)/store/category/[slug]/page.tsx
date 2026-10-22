import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StoreListing } from "@/components/store/StoreListing";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { serverGet, serverTry } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const cats = await serverTry<Category[]>("/categories", []);
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const c = (await serverTry<Category[]>("/categories", [])).find((x) => x.slug === slug);
  return { title: c?.name ?? "Shop" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  let categories: Category[] | null;
  let products: Product[] | null;
  try {
    [categories, products] = await Promise.all([serverGet<Category[]>("/categories"), serverGet<Product[]>(`/products?category=${encodeURIComponent(slug)}&limit=200`)]);
  } catch {
    return <ServiceUnavailable />;
  }
  const c = categories?.find((x) => x.slug === slug);
  if (!c) notFound();
  return (
    <>
      <PageHeader title={c.name} image={c.image} crumbs={[["Home", "/"], ["Shop", "/store"], [c.name]]} />
      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        <StoreListing products={products ?? []} categories={(categories ?? []).filter((x) => x.slug === c.slug || x.parent === c.slug)} category={c.slug} />
      </section>
    </>
  );
}
