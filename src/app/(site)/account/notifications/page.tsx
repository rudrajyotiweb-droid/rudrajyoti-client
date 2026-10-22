"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, CalendarCheck, Package, PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/account/AccountShell";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { AppNotification, Me } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast, useAuth } from "@/store";

const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "Yesterday" : d < 30 ? `${d} days ago` : new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const icons = { booking: CalendarCheck, order: Package, video: PlayCircle, offer: Sparkles, support: Bell, system: Bell } as const;

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-primary" : "bg-sand")}>
      <motion.span layout className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow", on ? "right-1" : "left-1")} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
    </button>
  );
}

export default function NotificationsPage() {
  const { data, loading } = useApi<AppNotification[]>("/account/notifications");
  const [list, setList] = useState<AppNotification[]>([]);
  useEffect(() => setList(data ?? []), [data]);
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const prefs = user?.notifPrefs ?? { whatsapp: true, push: true, email: true, sms: true, offers: true };

  const markRead = (ids?: string[]) => {
    setList((l) => l.map((n) => (!ids || ids.includes(n.id) ? { ...n, unread: false } : n)));
    void api("/account/notifications/read", { body: ids ? { ids } : {} }).catch(() => {});
  };
  const setPref = async (k: keyof Me["notifPrefs"]) => {
    try {
      setUser(await api<Me>("/account/profile", { method: "PATCH", body: { notifPrefs: { [k]: !prefs[k] } } }));
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-ink-muted">{list.filter((n) => n.unread).length} unread</p>
          <button onClick={() => markRead()} className="text-sm font-medium text-primary">
            Mark all as read
          </button>
        </div>
        {loading && !data && <div className="skeleton h-48 rounded-3xl" />}
        {!loading && list.length === 0 && <EmptyState icon={Bell} title="No notifications yet" text="Booking updates, puja videos and offers will appear here." />}
        <ul className="space-y-2">
          <AnimatePresence>
            {list.map((n, k) => {
              const I = icons[n.kind as keyof typeof icons] ?? Bell;
              return (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: k * 0.05 }}
                  onClick={() => n.unread && markRead([n.id])}
                  className={cn("flex cursor-pointer gap-3 rounded-2xl border p-4 transition", n.unread ? "border-primary/30 bg-white shadow-[var(--shadow-soft)]" : "border-border bg-white/60")}
                >
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", n.unread ? "bg-primary text-white" : "bg-bg text-primary")}>
                    <I className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {n.title} {n.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </p>
                    <p className="text-sm text-ink-muted">{n.body}</p>
                    <p className="mt-1 flex items-center gap-3 text-xs text-ink-muted/80">
                      {ago(n.time)}
                      {n.link && (
                        <Link href={n.link} className="font-medium text-primary">
                          View
                        </Link>
                      )}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </section>

      <aside className="h-fit rounded-3xl border border-border bg-white p-5">
        <p className="font-serif text-lg font-semibold">Notify me via</p>
        <div className="mt-4 space-y-4">
          {(
            [
              ["whatsapp", "WhatsApp", "Booking updates & puja video"],
              ["push", "Push notifications", "Reminders on this device"],
              ["email", "Email", "Receipts & invoices"],
              ["offers", "Festival offers", "New special pujas"],
            ] as const
          ).map(([k, t, d]) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <span>
                <b className="block text-sm">{t}</b>
                <span className="text-xs text-ink-muted">{d}</span>
              </span>
              <Toggle label={t} on={prefs[k]} onChange={() => setPref(k)} />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
