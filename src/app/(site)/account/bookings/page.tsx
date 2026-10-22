"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, ChevronDown, ExternalLink, MapPin, MessageCircle, Play, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, StatusTracker } from "@/components/account/AccountShell";
import { ButtonLink } from "@/components/ui/Button";
import { IstDate } from "@/components/ui/IstDate";
import { BOOKING_STEPS, CHADHAVA_STEPS, isHostedVideo, stepIndex } from "@/data/account";
import { useApi } from "@/lib/hooks";
import type { Booking } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";

const tabs = [
  ["upcoming", "Upcoming"],
  ["completed", "Completed"],
  ["chadhava", "Chadhava"],
] as const;

const DONE = ["Puja Performed", "Video Shared", "Box Dispatched", "Delivered", "Cancelled"];

export default function BookingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("upcoming");
  const [video, setVideo] = useState<Booking | null>(null);
  const { data, loading, error, reload } = useApi<Booking[]>("/account/bookings");
  const list = (data ?? []).filter((b) => (tab === "chadhava" ? b.type === "chadhava" : b.type === "puja" && (tab === "upcoming" ? !DONE.includes(b.status) : DONE.includes(b.status))));

  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-full border border-border bg-white p-1">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("relative flex-1 rounded-full py-2.5 text-sm font-medium transition", tab === id ? "text-white" : "text-ink-muted")}>
            {tab === id && <motion.span layoutId="bk-tab" className="absolute inset-0 rounded-full bg-primary" />}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="skeleton h-64 rounded-3xl" />
      ) : error && !data ? (
        <EmptyState icon={CalendarCheck} title="Couldn't load your bookings" text={error} action={<button onClick={reload} className="font-semibold text-primary">Try again</button>} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {list.length === 0 && (
              <EmptyState icon={CalendarCheck} title="No bookings here yet" text="Book a puja at a sacred temple in your name & gotra." action={<ButtonLink href={tab === "chadhava" ? "/chadhava" : "/puja"}>{tab === "chadhava" ? "Offer chadhava" : "Explore pujas"}</ButtonLink>} />
            )}
            {list.map((b, k) => (
              <BookingCard key={b.code} b={b} defaultOpen={k === 0} onVideo={() => setVideo(b)} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {video?.video && (
          <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVideo(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between text-white">
                <p className="font-serif text-lg">{video.title}</p>
                <button onClick={() => setVideo(null)} aria-label="Close video" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <video src={video.video} controls autoPlay playsInline className="aspect-video w-full rounded-2xl bg-black" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingCard({ b, defaultOpen, onVideo }: { b: Booking; defaultOpen?: boolean; onVideo: () => void }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const steps = b.type === "chadhava" ? CHADHAVA_STEPS : BOOKING_STEPS;
  const idx = stepIndex(steps, b.status);
  const cancelled = b.status === "Cancelled";
  const performed = ["Puja Performed", "Video Shared", "Box Dispatched", "Delivered"].includes(b.status);
  return (
    <motion.article layout className="overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-soft)]">
      <button onClick={() => setOpen(!open)} className="flex w-full gap-4 p-4 text-left" aria-expanded={open}>
        <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
          <Image src={b.image} alt="" fill sizes="80px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[0.7rem] text-ink-muted">
            <span className="font-mono">{b.code}</span>
            <span className={cn("rounded-full px-2 py-0.5 font-semibold", cancelled ? "bg-primary-soft text-primary" : idx === steps.length - 1 ? "bg-success/10 text-success" : "bg-amber-100 text-amber-700")}>{b.status}</span>
          </span>
          <span className="mt-1 line-clamp-1 block font-semibold">{b.title}</span>
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <MapPin className="h-3 w-3" /> <span className="line-clamp-1">{b.temple}</span>
          </span>
          {b.date && (
            <span className="text-xs text-ink-muted">
              <IstDate iso={b.date} opts={{ weekday: "short", day: "numeric", month: "short" }} />
            </span>
          )}
        </span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-ink-muted transition", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="grid gap-6 border-t border-border p-5 md:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="mb-3 text-sm font-semibold">Booking status</p>
                {cancelled ? (
                  <p className="rounded-2xl bg-primary-soft/60 p-4 text-sm">
                    This booking was cancelled.{b.paymentStatus.includes("efunded") ? " The amount has been refunded to your original payment method." : ""}
                  </p>
                ) : (
                  <StatusTracker steps={steps} current={Math.max(0, idx)} vertical />
                )}
              </div>
              <div className="space-y-4">
                <dl className="space-y-2 rounded-2xl bg-bg p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">{b.type === "puja" ? "Package" : "Offerings"}</dt>
                    <dd className="text-right font-medium">{b.pkg}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Sankalp names</dt>
                    <dd className="text-right font-medium">{b.names.join(", ")}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Gotra</dt>
                    <dd className="text-right font-medium">{b.gotra}</dd>
                  </div>
                  {b.addOns.length > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-muted">Add-ons</dt>
                      <dd className="text-right font-medium">{b.addOns.map((a) => (a.qty > 1 ? `${a.name} × ${a.qty}` : a.name)).join(", ")}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Amount paid</dt>
                    <dd className="font-semibold text-primary">{formatINR(b.amount)}</dd>
                  </div>
                  {b.shipment?.awb && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-muted">Aashirwad Box</dt>
                      <dd className="text-right font-medium">
                        {b.shipment.courier} · {b.shipment.awb}
                      </dd>
                    </div>
                  )}
                </dl>
                {b.video &&
                  (isHostedVideo(b.video) ? (
                    <button onClick={onVideo} className="group relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark to-[#2a0606]">
                      <Image src={b.image} alt="" fill sizes="400px" className="object-cover opacity-50 transition duration-700 group-hover:scale-105" />
                      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-white/95 text-primary transition group-hover:scale-110">
                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                      </span>
                      <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">Watch your puja video</span>
                    </button>
                  ) : (
                    <a href={b.video} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                      <Play className="h-4 w-4 fill-current" /> Watch your puja video <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                <div className="flex flex-wrap gap-2">
                  <Link href={`/account/support?ref=${b.code}`} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm hover:border-primary hover:text-primary">
                    <MessageCircle className="h-4 w-4" /> Help
                  </Link>
                  {performed && (
                    <Link href="/account/reviews" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm text-white">
                      <Star className="h-4 w-4" /> Write a review
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
