import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion } from "@/components/ui/misc";
import { getFaqs, getSettings } from "@/lib/settings";

export const metadata = { title: "Frequently Asked Questions" };
export const revalidate = 120;

const TITLES: Record<string, string> = { Puja: "Puja & Chadhava", Refunds: "Refunds", Store: "Store orders", Account: "Your account", General: "General" };
const ORDER = ["Puja", "Refunds", "Store", "Account", "General"];

/** FAQs come from Admin → Content → FAQs, grouped by their group. */
export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);
  const groups = [...new Set(faqs.map((f) => f.group))].sort((a, b) => (ORDER.indexOf(a) + 99) % 99 - (ORDER.indexOf(b) + 99) % 99);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title="FAQs" subtitle="Answers to common questions about pujas, chadhava and orders." image={settings.pageImages.faq} crumbs={[["Home", "/"], ["FAQs"]]} />
      <div className="mx-auto max-w-3xl space-y-10 px-4 pt-12 md:px-6">
        {faqs.length === 0 && <p className="text-center text-ink-muted">FAQs will appear here soon.</p>}
        {groups.map((g, i) => (
          <section key={g}>
            <h2 className="mb-4 font-serif text-2xl font-semibold">{TITLES[g] ?? g}</h2>
            <Accordion items={faqs.filter((f) => f.group === g)} defaultOpen={i === 0 ? 0 : -1} />
          </section>
        ))}
      </div>
    </>
  );
}
