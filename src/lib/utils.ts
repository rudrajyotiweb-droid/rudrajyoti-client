import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Formats rupees (whole number) as ₹1,501 */
export function formatINR(amount: number) {
  return `₹${inr.format(amount)}`;
}

export function discountPct(price: number, mrp?: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** "/puja/" → "/puja" (static export uses trailing slashes). */
export const normalizePath = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

export function formatDateIST(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    weekday: "long",
    ...opts,
  });
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
