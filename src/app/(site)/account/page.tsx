"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Flower2, Gift, Heart, MapPin, Package, PlayCircle, ShoppingBag, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountMenuList, ProfileCard, StatusTracker } from "@/components/account/AccountShell";
import { MiniCountdown } from "@/components/ui/Countdown";
import { IstDate } from "@/components/ui/IstDate";
import { Reveal } from "@/components/ui/Reveal";
import { BOOKING_STEPS, CHADHAVA_STEPS, ORDER_STEPS, stepIndex } from "@/data/account";
import { useApi } from "@/lib/hooks";
import type { Booking, Order, PujaCardT } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { useAuth, useWishlist } from "@/store";

type Summary = { upcoming: Booking[]; orders: Order[]; unread: number; counts: { bookings: number; orders: number }; latestVideo: Booking | null };

export default function AccountDashboard() {
  const user = useAuth((s) => s.user);
  const wishCount = useWishlist((s) => s.slugs.length);
  const { data } = useApi<Summary>("/account/summary");
  const suggestion = useApi<PujaCardT[]>("/pujas?featured=true&limit=1").data?.[0];
  const upcoming = data?.upcoming[0];
  const order = data?.orders[0];
  const video = data?.latestVideo;
  const [greet, setGreet] = useState("Namaskar");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreet(hour < 12 ? "Suprabhat" : hour < 17 ? "Namaskar" : "Shubh Sandhya");
  }, []);

  const upSteps = upcoming?.type === "chadhava" ? CHADHAVA_STEPS : BOOKING_STEPS;
  const orderIdx = order ? stepIndex(ORDER_STEPS, order.status) : -1;

  return (
    <div className="space-y-6">
      {/* Mobile: profile header + menu (matches the client mock) */}
      <div className="space-y-4 lg:hidden">
        <ProfileCard compact />
      </div>

      <Reveal className="hidden lg:block">
        <p className="text-sm text-ink-muted">{greet},</p>
        <h1 className="font-serif text-3xl font-semibold">
          {(user?.name || "Devotee").split(" ")[0]} <span className="text-primary">🙏</span>
        </h1>
        {!user?.name && (
          <Link href="/account/profile" className="text-sm font-medium text-primary hover:underline">
            Complete your profile
          </Link>
        )}
      </Reveal>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {[
          { href: "/account/bookings", label: "Bookings", value: data?.counts.bookings, icon: CalendarCheck },
          { href: "/account/orders", label: "Orders", value: data?.counts.orders, icon: Package },
          { href: "/account/family", label: "Family", value: user?.family.length ?? 0, icon: Users },
          { href: "/account/wishlist", label: "Wishlist", value: wishCount, icon: Heart },
        ].map(({ href, label, value, icon: I }, k) => (
          <motion.div key={href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.06 }}>
            <Link href={href} className="group flex flex-col items-center gap-1 rounded-2xl border border-border bg-white py-3 text-center transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] md:flex-row md:gap-3 md:px-4 md:py-4 md:text-left">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white">
                <I className="h-5 w-5" />
              </span>
              <span>
                <b className="block text-lg leading-none md:text-2xl">{value ?? "–"}</b>
                <span className="text-[0.68rem] text-ink-muted md:text-xs">{label}</span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Upcoming puja */}
      {upcoming && (
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> Upcoming {upcoming.type === "chadhava" ? "offering" : "puja"}
              </p>
              <Link href="/account/bookings" className="text-xs font-medium text-primary">
                View all
              </Link>
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-[180px_1fr]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-square">
                <Image src={upcoming.image} alt="" fill sizes="200px" className="object-cover" />
                {upcoming.date && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
                    in <MiniCountdown to={upcoming.date} />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-serif text-xl font-semibold">{upcoming.title}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {upcoming.temple}
                </p>
                <p className="text-sm text-ink-muted">
                  {upcoming.date && <IstDate iso={upcoming.date} />} · {upcoming.pkg}
                </p>
                <div className="mt-5">
                  <StatusTracker steps={upSteps} current={Math.max(0, stepIndex(upSteps, upcoming.status))} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Latest order */}
        {order && (
          <Reveal>
            <div className="h-full rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Latest order</p>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{order.status}</span>
              </div>
              <div className="mt-4 flex -space-x-3">
                {order.items.slice(0, 5).map((i) => (
                  <span key={i.slug + (i.variant ?? "")} className="relative h-14 w-14 overflow-hidden rounded-xl ring-2 ring-white">
                    <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                {order.code} · {formatINR(order.total)}
              </p>
              {orderIdx >= 0 && (
                <div className="mt-4">
                  <StatusTracker steps={ORDER_STEPS} current={orderIdx} />
                </div>
              )}
              <Link href="/account/orders" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Track order <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        )}

        {/* Video ready */}
        {video && (
          <Reveal delay={0.08}>
            <Link href="/account/bookings" className="group relative block h-full min-h-56 overflow-hidden rounded-3xl">
              <Image src={video.image} alt="" fill sizes="400px" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <PlayCircle className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-white/90 transition group-hover:scale-110" strokeWidth={1.4} />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="rounded-full bg-success px-2.5 py-1 text-[0.65rem] font-semibold">VIDEO READY</span>
                <p className="mt-2 font-serif text-lg">{video.title}</p>
                <p className="text-xs text-white/75">Performed in your name · {video.temple}</p>
              </div>
            </Link>
          </Reveal>
        )}
      </div>

      {/* Suggestion */}
      {suggestion && (
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#fff1d6] to-primary-soft p-5 md:p-6">
            <div className="flex items-center gap-4">
              <span className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:block">
                <Image src={suggestion.images[0]} alt="" fill sizes="80px" className="object-cover" />
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">Recommended for your family</p>
                <p className="mt-1 font-serif text-lg font-semibold">{suggestion.title}</p>
                <p className="text-sm text-ink-muted">{suggestion.subtitle}</p>
              </div>
              <Link href={`/puja/${suggestion.slug}`} aria-label={`Book ${suggestion.title}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white shadow-[var(--shadow-glow)]">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      {/* Quick links */}
      <div className="hidden gap-4 md:grid md:grid-cols-3">
        {[
          ["/puja", Flower2, "Book a puja"],
          ["/store", ShoppingBag, "Shop samagri"],
          ["/chadhava", Gift, "Offer chadhava"],
        ].map(([href, I, t]) => {
          const C = I as typeof Gift;
          return (
            <Link key={href as string} href={href as string} className={cn("group flex items-center gap-3 rounded-2xl border border-border bg-white p-4 transition hover:border-primary")}>
              <C className="h-5 w-5 text-primary" />
              <span className="flex-1 font-medium">{t as string}</span>
              <ArrowRight className="h-4 w-4 text-ink-muted transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          );
        })}
      </div>

      {/* Mobile menu list */}
      <AccountMenuList className="lg:hidden" unread={data?.unread ?? 0} />
    </div>
  );
}
