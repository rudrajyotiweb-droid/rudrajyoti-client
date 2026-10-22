"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingCart, User, X, ChevronRight, Phone, Mail, Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { nav } from "@/data/site";
import { useSite } from "@/lib/site";
import { useHydrated, useScrolled } from "@/lib/hooks";
import { cn, normalizePath } from "@/lib/utils";
import { useCart, useUi } from "@/store";
import { FontSizeControl } from "./FontSizeControl";
import { SearchOverlay } from "./SearchOverlay";

export function isActive(pathname: string, href: string) {
  const p = normalizePath(pathname);
  return href === "/" ? p === "/" : p === href || p.startsWith(`${href}/`);
}

export function CartButton({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const pulse = useUi((s) => s.cartPulse);
  return (
    <Link href="/cart" aria-label="Cart" className={cn("relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-primary-soft", className)}>
      <motion.span key={pulse} animate={pulse ? { rotate: [0, -14, 12, -8, 0], scale: [1, 1.15, 1] } : undefined} transition={{ duration: 0.6 }}>
        <ShoppingCart className="h-[1.3rem] w-[1.3rem]" />
      </motion.span>
      <AnimatePresence>
        {hydrated && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold text-white ring-2 ring-white"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const { brand } = useSite();

  useEffect(() => setMenu(false), [pathname]);

  return (
    <>
      {/* Announcement bar */}
      <div className="hidden bg-primary-dark text-white md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-xs">
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
            Book pujas at sacred temples in your name — get the puja video on WhatsApp &amp; a free Aashirwad Box.
            <Link href="/puja" className="font-semibold underline-offset-2 hover:underline">
              Book now
            </Link>
          </p>
          <div className="flex items-center gap-4 text-white/85">
            <a href={`tel:${brand.phone}`} className="flex items-center gap-1 hover:text-white">
              <Phone className="h-3.5 w-3.5" /> {brand.phone}
            </a>
            <FontSizeControl />
            <button className="flex items-center gap-1 hover:text-white" aria-label="Change language">
              <Languages className="h-3.5 w-3.5" /> EN | বাং
            </button>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "pt-safe sticky top-0 z-40 transition-all duration-500",
          scrolled ? "bg-white/85 shadow-[0_6px_24px_-14px_rgb(120_40_20/0.35)] backdrop-blur-xl" : "bg-bg/70 backdrop-blur-md",
        )}
      >
        {/* fixed height: shrinking the header on scroll would shift the page and break anchor offsets */}
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-6">
          <button className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-primary-soft md:hidden" aria-label="Open menu" onClick={() => setMenu(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Logo compact={scrolled} className="md:mr-6" />

          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
            {nav.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn("relative px-3.5 py-2 text-[0.92rem] font-medium transition-colors", active ? "text-primary" : "text-ink hover:text-primary")}
                >
                  {n.label}
                  {active && (
                    <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 md:ml-4">
            <button aria-label="Search" onClick={() => setSearch(true)} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-primary-soft">
              <Search className="h-[1.2rem] w-[1.2rem]" />
            </button>
            <Link href="/account/wishlist" aria-label="Wishlist" className="hidden h-10 w-10 place-items-center rounded-full transition hover:bg-primary-soft md:grid">
              <Heart className="h-[1.2rem] w-[1.2rem]" />
            </Link>
            <CartButton />
            <Link href="/account" aria-label="Account" className="hidden h-10 w-10 place-items-center rounded-full transition hover:bg-primary-soft md:grid">
              <User className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menu && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.aside
              className="pt-safe fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-sm flex-col bg-bg shadow-2xl md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mandala-bg flex items-center justify-between border-b border-border px-5 py-4">
                <Logo compact />
                <button aria-label="Close menu" onClick={() => setMenu(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-primary-soft">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                {[...nav, { href: "/how-it-works", label: "How it works" }, { href: "/faq", label: "FAQs" }, { href: "/contact", label: "Contact us" }].map((n, i) => (
                  <motion.div key={n.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <Link
                      href={n.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3.5 text-[0.95rem] font-medium",
                        isActive(pathname, n.href) ? "bg-primary-soft text-primary" : "text-ink hover:bg-sand/50",
                      )}
                    >
                      {n.label}
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="space-y-3 border-t border-border p-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Text size</span>
                  <FontSizeControl dark />
                </div>
                <a href={`tel:${brand.phone}`} className="flex items-center gap-2 text-ink">
                  <Phone className="h-4 w-4 text-primary" /> {brand.phone}
                </a>
                <a href={`mailto:${brand.email}`} className="flex items-center gap-2 text-ink">
                  <Mail className="h-4 w-4 text-primary" /> {brand.email}
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}
