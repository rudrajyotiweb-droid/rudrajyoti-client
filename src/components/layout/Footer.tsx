import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { BrandMark, Wordmark } from "@/components/brand/Logo";
import { Ornament } from "@/components/ui/Ornament";
import { site } from "@/data/site";
import type { SiteSettings } from "@/lib/types";

const cols = [
  {
    title: "Services",
    links: [
      ["Book a Puja", "/puja"],
      ["Chadhava", "/chadhava"],
      ["Temples", "/temples"],
      ["Shop", "/store"],
      ["How it works", "/how-it-works"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About us", "/about"],
      ["Contact", "/contact"],
      ["FAQs", "/faq"],
      ["Image credits", "/credits"],
    ],
  },
  {
    title: "Policies",
    links: [
      ["Privacy policy", "/pages/privacy"],
      ["Terms of use", "/pages/terms"],
      ["Refund policy", "/pages/refund"],
      ["Shipping policy", "/pages/shipping"],
    ],
  },
];

const social = [
  { label: "Instagram", d: "M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" },
  { label: "Facebook", d: "M14 8V6.3c0-.8.2-1.3 1.4-1.3H17V2.2C16.7 2.1 15.7 2 14.6 2 12.2 2 10.5 3.5 10.5 6.2V8H8v3h2.5v11H14V11h2.6l.4-3H14Z" },
  { label: "YouTube", d: "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" },
];

export function Footer({ brand }: { brand: SiteSettings["brand"] }) {
  return (
    <footer className="relative mt-16 overflow-hidden bg-primary-dark text-white">
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] animate-spin-slow opacity-[0.07]"
        style={{ backgroundImage: "url(/assets/patterns/mandala.svg)", backgroundSize: "contain", filter: "brightness(0) invert(1)" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-28 md:px-6 md:pb-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
              {/* emblem sits on a cream disc so the brown trident stays visible on the red footer */}
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-bg shadow-[0_8px_24px_-8px_rgb(0_0_0/0.45)] ring-2 ring-accent/60">
                <BrandMark className="h-12 w-12" />
              </span>
              <span className="flex flex-col">
                <Wordmark light className="h-7" />
                <span className="mt-1.5 block text-[0.7rem] tracking-[0.1em] text-white/75">{site.tagline}</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">{site.description}</p>
            <div className="mt-6 flex gap-2">
              {social.map((s) => (
                <a key={s.label} href="#" aria-label={s.label} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:-translate-y-0.5 hover:bg-white hover:text-primary">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="font-serif text-lg">{c.title}</h3>
              <Ornament className="mt-1 -ml-1 w-24 text-accent/80" />
              <ul className="mt-4 space-y-2.5 text-sm text-white/75">
                {c.links.map(([l, h]) => (
                  <li key={l}>
                    <Link href={h} className="transition hover:pl-1 hover:text-white">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 border-t border-white/15 pt-8 text-sm text-white/75 md:grid-cols-3">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {brand.address}
          </p>
          <a href={`tel:${brand.phone}`} className="flex items-center gap-2 hover:text-white">
            <Phone className="h-4 w-4" /> {brand.phone} · {brand.supportHours}
          </a>
          <a href={`mailto:${brand.email}`} className="flex items-center gap-2 hover:text-white">
            <Mail className="h-4 w-4" /> {brand.email}
          </a>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-white/60 md:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Secure payments</span>
            {["UPI", "Visa", "RuPay", "Razorpay"].map((p) => (
              <span key={p} className="rounded-md bg-white/10 px-2 py-1 font-semibold text-white/85">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
