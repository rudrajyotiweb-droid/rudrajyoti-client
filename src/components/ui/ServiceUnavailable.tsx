import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { Om } from "@/components/ui/Ornament";

/** Shown when the API cannot be reached — the page never crashes or renders blank. */
export function ServiceUnavailable({ title = "We'll be right back", text = "We couldn't load this page just now. Please check your connection and try again in a moment." }: { title?: string; text?: string }) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <Om className="text-5xl text-primary/70" />
      <h1 className="mt-4 font-serif text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-ink-muted">{text}</p>
      <div className="mt-6 flex gap-3">
        <a href="" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-[var(--shadow-glow)] hover:bg-primary-dark">
          <RefreshCw className="h-4 w-4" /> Try again
        </a>
        <Link href="/" className="inline-flex h-11 items-center rounded-full border border-border bg-white px-6 text-sm font-semibold hover:bg-bg">
          Home
        </Link>
      </div>
    </div>
  );
}
