import { notFound } from "next/navigation";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { serverGet, serverTry } from "@/lib/api";
import { getFaqs } from "@/lib/settings";
import type { ChadhavaCardT, ChadhavaDetailT } from "@/lib/types";
import { ChadhavaDetail } from "./ChadhavaDetail";

export const revalidate = 30;
export const dynamicParams = true;

export async function generateStaticParams() {
  const list = await serverTry<ChadhavaCardT[]>("/chadhava", []);
  return list.map((c) => ({ slug: c.slug }));
}

const load = (slug: string) => serverGet<ChadhavaDetailT>(`/chadhava/${encodeURIComponent(slug)}`, { revalidate: 30 });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = await load((await params).slug).catch(() => null);
  return { title: c?.title ?? "Chadhava", description: c?.subtitle };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  let c: ChadhavaDetailT | null;
  try {
    c = await load((await params).slug);
  } catch {
    return <ServiceUnavailable />;
  }
  if (!c) notFound();
  const faqs = (await getFaqs()).filter((f) => f.group !== "Store").slice(0, 6);
  return <ChadhavaDetail c={c} faqs={faqs} />;
}
