import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { serverGet } from "@/lib/api";
import type { PujaDetail } from "@/lib/types";
import { BookingFlow } from "./BookingFlow";

export const metadata = { title: "Book Puja", robots: { index: false } };
// always fresh: prices, cutoff and add-ons must match what the server will charge
export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let puja: PujaDetail | null;
  try {
    puja = await serverGet<PujaDetail>(`/pujas/${encodeURIComponent(slug)}`, { revalidate: 0 });
  } catch {
    return <ServiceUnavailable />;
  }
  if (!puja) notFound();
  return (
    <Suspense fallback={<div className="mx-auto mt-10 h-96 max-w-6xl rounded-3xl skeleton" />}>
      <BookingFlow puja={puja} />
    </Suspense>
  );
}
