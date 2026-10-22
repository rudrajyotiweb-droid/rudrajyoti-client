import { formatDateIST } from "@/lib/utils";

/** A date rendered in India time (same on server and client, so no hydration mismatch). */
export function IstDate({ iso, opts }: { iso: string; opts?: Intl.DateTimeFormatOptions }) {
  return <>{formatDateIST(iso, opts)}</>;
}
