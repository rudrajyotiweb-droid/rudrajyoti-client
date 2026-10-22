import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { serverTry } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import type { Temple } from "@/lib/types";
import { TempleDirectory } from "./TempleDirectory";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Sacred Temples of India",
  description: "Explore Jyotirlingas, Shakti Peethas and Char Dham temples where you can book puja and chadhava online.",
};

export default async function TemplesPage() {
  const [temples, settings] = await Promise.all([serverTry<Temple[]>("/temples", []), getSettings()]);
  return (
    <>
      <PageHeader
        title="Sacred Temples"
        subtitle="Jyotirlingas, Shakti Peethas and Dhams where our pandits perform pujas on your behalf."
        image={settings.pageImages.temples}
        crumbs={[["Home", "/"], ["Temples"]]}
      />
      <TempleDirectory temples={temples} />
    </>
  );
}
