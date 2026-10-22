import Link from "next/link";
import { Diya } from "@/components/ui/Ornament";

export default function NotFound() {
  return (
    <main className="mandala-bg grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Diya className="mx-auto h-24 w-24" />
        <p className="mt-4 font-serif text-6xl font-semibold text-primary">404</p>
        <h1 className="mt-2 font-serif text-2xl">This path is not on our map</h1>
        <p className="mt-2 text-ink-muted">The page you are looking for may have moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="inline-flex h-11 items-center rounded-full bg-primary px-6 font-medium text-white">
            Go home
          </Link>
          <Link href="/puja" className="inline-flex h-11 items-center rounded-full border border-primary px-6 font-medium text-primary">
            Browse pujas
          </Link>
        </div>
      </div>
    </main>
  );
}
