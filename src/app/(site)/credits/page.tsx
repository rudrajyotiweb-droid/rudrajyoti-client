import credits from "@/data/credits.json";

export const metadata = { title: "Image credits" };

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <h1 className="font-serif text-3xl font-semibold">Image credits</h1>
      <p className="mt-2 text-sm text-ink-muted">Photographs are from Wikimedia Commons under free licenses and are used with attribution. They are placeholders until our own photography is added.</p>
      <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-white text-sm">
        {credits.map((c) => (
          <li key={c.file} className="flex flex-col gap-1 px-4 py-3 md:flex-row md:items-center md:gap-4">
            <span className="flex-1 truncate">{c.title}</span>
            <span className="text-ink-muted md:w-48 md:truncate">{c.author}</span>
            <span className="rounded-full bg-bg px-2 py-0.5 text-xs">{c.license}</span>
            <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Source
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
