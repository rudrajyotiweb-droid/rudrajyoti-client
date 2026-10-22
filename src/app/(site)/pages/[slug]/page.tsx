import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Markdown } from "@/components/ui/Markdown";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { serverGet } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import { formatDateIST } from "@/lib/utils";

export const revalidate = 300;
export const dynamicParams = true;

type CmsPage = { slug: string; title: string; body: string; updatedAt: string };

/** Policy pages managed in Admin → Content → Pages (privacy, terms, refund, shipping…). */
export function generateStaticParams() {
  return ["privacy", "terms", "refund", "shipping"].map((slug) => ({ slug }));
}

const load = (slug: string) => serverGet<CmsPage>(`/pages/${encodeURIComponent(slug)}`, { revalidate: 300 });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug).catch(() => null);
  return { title: p?.title ?? "Page" };
}

export default async function CmsPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  let page: CmsPage | null;
  try {
    page = await load((await params).slug);
  } catch {
    return <ServiceUnavailable />;
  }
  if (!page) notFound();
  const { pageImages } = await getSettings();
  // the first "# Title" line duplicates the header, so drop it
  const body = page.body.replace(/^#\s+.*\n+/, "");
  return (
    <>
      <PageHeader title={page.title} image={pageImages.policy} crumbs={[["Home", "/"], [page.title]]} />
      <article className="mx-auto max-w-3xl px-4 pt-10 md:px-6">
        <Markdown source={body} />
        <p className="mt-10 text-xs text-ink-muted">Last updated {formatDateIST(page.updatedAt, { weekday: undefined, year: "numeric" })}</p>
      </article>
    </>
  );
}
