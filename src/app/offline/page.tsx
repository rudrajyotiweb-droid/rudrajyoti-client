import Link from "next/link";
import { BrandMark } from "@/components/brand/Logo";

export const metadata = { title: "You are offline" };

/** Fallback served by the service worker when a page isn't cached. */
export default function OfflinePage() {
  return (
    <main className="mandala-bg grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <BrandMark className="mx-auto h-24 w-24" />
        <h1 className="mt-6 font-serif text-3xl font-semibold">You are offline</h1>
        <p className="mt-2 text-ink-muted">Please check your internet connection. Pages you visited earlier are still available.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 font-medium text-white">
          Try again
        </Link>
      </div>
    </main>
  );
}
