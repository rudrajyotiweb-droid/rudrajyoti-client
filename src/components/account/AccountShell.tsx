"use client";

import { motion } from "framer-motion";
import {
  Bell,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandMark } from "@/components/brand/Logo";
import { site } from "@/data/site";
import { useApi, useHydrated } from "@/lib/hooks";
import { cn, initials, normalizePath } from "@/lib/utils";
import { useAuth } from "@/store";

export const accountMenu = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, desktopOnly: true },
  { href: "/account/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/family", label: "Family & Gotra", icon: Users },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My Reviews", icon: Star },
  { href: "/account/notifications", label: "Notifications", icon: Bell, badge: true },
  { href: "/account/profile", label: "Profile & Settings", icon: UserRound },
  { href: "/account/support", label: "Help & Support", icon: Headphones },
];

export function ProfileCard({ compact }: { compact?: boolean }) {
  const user = useAuth((s) => s.user);
  const name = user?.name || "Devotee";
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white">
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 animate-spin-slow opacity-15" style={{ backgroundImage: "url(/assets/patterns/mandala.svg)", backgroundSize: "contain", filter: "brightness(0) invert(1)" }} />
      <div className="relative flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/20 font-serif text-xl font-semibold ring-2 ring-white/40 backdrop-blur">{initials(name)}</span>
        <div className="min-w-0">
          <p className="text-xs text-white/75">Namaste 🙏</p>
          <p className="truncate font-serif text-xl font-semibold">{name}</p>
          {!compact && <p className="text-xs text-white/75">{user?.phoneDisplay}</p>}
        </div>
        <Link href="/account/profile" aria-label="Edit profile" className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function AccountMenuList({ className, unread = 0 }: { className?: string; unread?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  return (
    <nav className={cn("overflow-hidden rounded-3xl border border-border bg-white", className)} aria-label="Account">
      {accountMenu.map(({ href, label, icon: I, badge, desktopOnly }) => {
        const active = normalizePath(pathname) === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group relative flex items-center gap-3 border-b border-border px-4 py-3.5 text-[0.92rem] transition last:border-b-0",
              active ? "bg-primary-soft/60 font-semibold text-primary" : "hover:bg-bg",
              desktopOnly && "hidden lg:flex",
            )}
          >
            {active && <motion.span layoutId="acct-active" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />}
            <span className={cn("grid h-9 w-9 place-items-center rounded-xl transition", active ? "bg-primary text-white" : "bg-bg text-primary group-hover:bg-primary-soft")}>
              <I className="h-[1.1rem] w-[1.1rem]" />
            </span>
            <span className="flex-1">{label}</span>
            {badge && unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[0.65rem] font-semibold text-white">{unread > 99 ? "99+" : unread}</span>}
            <ChevronRight className="h-4 w-4 text-ink-muted/60 transition group-hover:translate-x-0.5" />
          </Link>
        );
      })}
      <button
        onClick={async () => {
          await logout();
          router.replace("/");
        }}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[0.92rem] text-primary hover:bg-primary-soft/40"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft">
          <LogOut className="h-[1.1rem] w-[1.1rem]" />
        </span>
        Logout
      </button>
    </nav>
  );
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = normalizePath(pathname);
  const isRoot = path === "/account";
  const current = accountMenu.find((m) => m.href === path);
  const router = useRouter();
  const hydrated = useHydrated();
  const signedIn = useAuth((s) => !!s.accessToken);
  const unread = useApi<{ unread: number }>(signedIn ? "/account/summary" : null).data?.unread ?? 0;

  // every account page needs a signed-in devotee
  useEffect(() => {
    if (hydrated && !signedIn) router.replace(`/login?next=${encodeURIComponent(path + window.location.search)}`);
  }, [hydrated, signedIn, router, path]);

  if (!hydrated || !signedIn)
    return (
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        <div className="skeleton h-72 rounded-3xl" />
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-10 md:px-6 md:pt-8">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-4">
            <ProfileCard />
            <AccountMenuList unread={unread} />
            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-ink-muted">
              <BrandMark className="h-6 w-6" /> {site.tagline}
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          {!isRoot && current && (
            <div className="mb-5 flex items-center gap-3">
              <Link href="/account" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white lg:hidden" aria-label="Back to account">
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <h1 className="font-serif text-2xl font-semibold md:text-3xl">{current.label}</h1>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: I, title, text, action }: { icon: typeof Heart; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-14 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
        <I className="h-7 w-7" />
      </span>
      <p className="mt-4 font-serif text-xl font-semibold">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Animated horizontal/vertical status tracker. */
export function StatusTracker({ steps, current, vertical }: { steps: readonly string[]; current: number; vertical?: boolean }) {
  if (vertical)
    return (
      <ol className="relative">
        {steps.map((s, i) => {
          const done = i <= current;
          return (
            <motion.li key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative flex gap-3 pb-4 last:pb-0">
              {i < steps.length - 1 && <span className={cn("absolute top-6 left-[0.68rem] h-full w-0.5", i < current ? "bg-success" : "bg-border")} />}
              <span className={cn("relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.6rem] font-bold", done ? "bg-success text-white" : "border-2 border-border bg-white text-ink-muted")}>
                {done ? "✓" : i + 1}
              </span>
              <span className={cn("pt-0.5 text-sm", done ? "font-medium" : "text-ink-muted", i === current && "text-success")}>
                {s}
                {i === current && <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-success" />}
              </span>
            </motion.li>
          );
        })}
      </ol>
    );
  const pct = (current / (steps.length - 1)) * 100;
  return (
    <div>
      <div className="relative mx-3 h-1.5 rounded-full bg-sand">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-success to-emerald-500" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
        <div className="absolute inset-0 flex justify-between">
          {steps.map((s, i) => (
            <span key={s} className={cn("-mt-[5px] h-4 w-4 rounded-full border-2 transition-colors delay-500", i <= current ? "border-success bg-success" : "border-border bg-white")} />
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-between text-[0.6rem] leading-tight text-ink-muted md:text-xs">
        {steps.map((s, i) => (
          <span key={s} className={cn("w-12 text-center first:text-left last:text-right md:w-20", i === current && "font-semibold text-success")}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
