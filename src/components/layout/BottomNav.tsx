"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useSite } from "@/lib/site";
import { cn, normalizePath } from "@/lib/utils";
import { isActive } from "./Header";

/** Pages with their own sticky bottom CTA hide the tab bar. */
export const hideBottomNav = (path: string) => {
  const p = normalizePath(path);
  return /^\/puja\/[^/]+\/book$/.test(p) || p === "/checkout" || p === "/login";
};

export function BottomNav() {
  const pathname = usePathname();
  // Tabs come from Admin → Home Page → Bottom nav (max 5)
  const tabs = useSite().bottomNav.slice(0, 5);
  if (hideBottomNav(pathname) || !tabs.length) return null;
  return (
    <nav
      aria-label="App"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/90 shadow-[0_-8px_30px_-18px_rgb(120_40_20/0.35)] backdrop-blur-xl md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map(({ link: href, label, icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link href={href} className="relative flex flex-col items-center gap-0.5 pt-2 pb-1.5" aria-current={active ? "page" : undefined}>
                {active && (
                  <motion.span layoutId="tab-pill" className="absolute top-1 h-8 w-14 rounded-full bg-primary-soft" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
                )}
                <motion.span animate={active ? { y: -1, scale: 1.08 } : { y: 0, scale: 1 }} className="relative">
                  <Icon name={icon} className={cn("h-[1.35rem] w-[1.35rem] transition-colors", active ? "text-primary" : "text-ink-muted")} strokeWidth={active ? 2.2 : 1.8} />
                </motion.span>
                <span className={cn("relative text-[0.66rem] font-medium whitespace-nowrap transition-colors", active ? "text-primary" : "text-ink-muted")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
