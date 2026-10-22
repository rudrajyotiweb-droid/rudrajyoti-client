"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { EmptyState } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/Button";
import { inputCls } from "@/components/ui/misc";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { toast } from "@/store";

type Pending = { refCode: string; productSlug?: string; title: string; image: string; kind: string };
type Mine = { id: string; target: string; kind: string; rating: number; text: string; status: string; reply?: string; date: string };

/** Only completed bookings / delivered orders can be reviewed (BRD §6.13) — the API enforces it. */
export default function ReviewsPage() {
  const pending = useApi<Pending[]>("/account/reviews/pending");
  const mine = useApi<Mine[]>("/account/reviews");

  if (pending.loading && !pending.data) return <div className="skeleton h-48 rounded-3xl" />;
  const items = pending.data ?? [];
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">Share your experience to help other devotees. Reviews are published after moderation.</p>
      {items.length === 0 && !(mine.data ?? []).length && <EmptyState icon={Star} title="Nothing to review yet" text="After your puja is performed or your order is delivered, you can review it here." />}
      {items.map((p, k) => (
        <ReviewForm key={p.refCode + (p.productSlug ?? "")} item={p} delay={k * 0.06} onDone={mine.reload} />
      ))}

      {(mine.data ?? []).length > 0 && (
        <section className="pt-4">
          <p className="mb-3 font-serif text-xl font-semibold">My reviews</p>
          <ul className="space-y-3">
            {mine.data!.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-white p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <b className="truncate">{r.target}</b>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", r.status === "Approved" ? "bg-success/10 text-success" : r.status === "Rejected" ? "bg-primary-soft text-primary" : "bg-amber-100 text-amber-700")}>
                    {r.status === "Pending" ? "In review" : r.status}
                  </span>
                </div>
                <p className="mt-1 text-accent">{"★".repeat(r.rating)}</p>
                {r.text && <p className="mt-1 text-ink-muted">{r.text}</p>}
                {r.reply && (
                  <p className="mt-2 rounded-xl bg-bg px-3 py-2 text-xs">
                    <b>Rudra Jyoti:</b> {r.reply}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ReviewForm({ item, delay, onDone }: { item: Pending; delay: number; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api("/account/reviews", { body: { refCode: item.refCode, productSlug: item.productSlug, rating, text: text.trim() } });
      setSent(true);
      toast("Thank you for your review 🙏");
      onDone();
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="rounded-3xl border border-border bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
          <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-muted">
            {item.kind} · {item.refCode}
          </p>
          <p className="truncate font-semibold">{item.title}</p>
        </div>
        {sent && <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">Submitted</span>}
      </div>
      {!sent && (
        <>
          <div className="mt-4 flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.button key={i} whileTap={{ scale: 0.8 }} whileHover={{ scale: 1.15 }} onMouseEnter={() => setHover(i)} onClick={() => setRating(i)} aria-label={`${i} stars`}>
                <Star className={cn("h-8 w-8 transition", i <= (hover || rating) ? "fill-accent text-accent" : "text-sand")} />
              </motion.button>
            ))}
          </div>
          <textarea rows={3} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder="Tell us about your experience…" className={cn(inputCls, "mt-3 h-auto py-3")} />
          <div className="mt-3 flex justify-end">
            <Button size="sm" disabled={!rating || busy} onClick={submit}>
              {busy ? "Submitting…" : "Submit review"}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
