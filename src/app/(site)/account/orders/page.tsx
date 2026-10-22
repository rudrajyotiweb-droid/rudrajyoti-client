"use client";

import { motion } from "framer-motion";
import { Package, RotateCcw, Truck, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, StatusTracker } from "@/components/account/AccountShell";
import { ButtonLink } from "@/components/ui/Button";
import { IstDate } from "@/components/ui/IstDate";
import { ORDER_STEPS, stepIndex } from "@/data/account";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { Order } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { toast } from "@/store";

export default function OrdersPage() {
  const { data, loading, error, reload, mutate } = useApi<Order[]>("/account/orders");
  const [busy, setBusy] = useState<string | null>(null);

  const replace = (o: Order) => mutate((list) => list?.map((x) => (x.code === o.code ? o : x)));

  const cancel = async (o: Order) => {
    if (!window.confirm(`Cancel order ${o.code}?${o.paymentMethod === "Prepaid" ? " The amount will be refunded to your original payment method." : ""}`)) return;
    setBusy(o.code);
    try {
      replace(await api<Order>(`/account/orders/${o.code}/cancel`, { body: {} }));
      toast("Order cancelled");
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setBusy(null);
    }
  };

  const requestReturn = async (o: Order) => {
    const reason = window.prompt("What is wrong with the item? (damaged / wrong item)");
    if (!reason || reason.trim().length < 5) return reason !== null && toast("Please describe the problem in a few words", "error");
    setBusy(o.code);
    try {
      replace(await api<Order>(`/account/orders/${o.code}/return`, { body: { reason: reason.trim() } }));
      toast("Return requested — our team will contact you");
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setBusy(null);
    }
  };

  if (loading && !data) return <div className="skeleton h-64 rounded-3xl" />;
  if (error && !data)
    return (
      <EmptyState icon={Package} title="Couldn't load your orders" text={error} action={<button onClick={reload} className="font-semibold text-primary">Try again</button>} />
    );
  if (!data?.length) return <EmptyState icon={Package} title="No orders yet" text="Authentic puja samagri and spiritual products, delivered across India." action={<ButtonLink href="/store">Start shopping</ButtonLink>} />;

  return (
    <div className="space-y-4">
      {data.map((o, k) => {
        const idx = stepIndex(ORDER_STEPS, o.status);
        const offTrack = idx < 0;
        return (
          <motion.article key={o.code} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(k, 6) * 0.06 }} className="overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-alt px-5 py-3 text-sm">
              <span>
                <span className="font-mono font-semibold">{o.code}</span>
                <span className="ml-2 text-ink-muted">
                  · <IstDate iso={o.date} opts={{ weekday: undefined, day: "numeric", month: "short" }} /> · {o.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}
                </span>
              </span>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", o.status === "Delivered" ? "bg-success/10 text-success" : offTrack ? "bg-primary-soft text-primary" : "bg-amber-100 text-amber-700")}>{o.status}</span>
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {o.items.map((i) => (
                  <li key={i.slug + (i.variant ?? "")} className="flex items-center gap-3">
                    <Link href={`/store/product/${i.slug}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
                    </Link>
                    <span className="flex-1 text-sm">
                      <span className="block font-medium">{i.name}</span>
                      <span className="text-ink-muted">
                        Qty {i.qty}
                        {i.variant && ` · ${i.variant}`}
                      </span>
                    </span>
                    <span className="text-sm font-semibold">{formatINR(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              {!offTrack && (
                <div className="mt-6">
                  <StatusTracker steps={ORDER_STEPS} current={idx} />
                </div>
              )}
              {o.awb && (
                <p className="mt-5 flex items-center gap-2 rounded-xl bg-bg px-4 py-3 text-sm">
                  <Truck className="h-4 w-4 text-primary" /> {o.courier ?? "Courier"} · AWB {o.awb}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-auto font-semibold">Total {formatINR(o.total)}</span>
                {o.canCancel && (
                  <button disabled={busy === o.code} onClick={() => cancel(o)} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm text-primary disabled:opacity-50">
                    <XCircle className="h-4 w-4" /> Cancel
                  </button>
                )}
                {o.canReturn && (
                  <button disabled={busy === o.code} onClick={() => requestReturn(o)} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm hover:border-primary hover:text-primary disabled:opacity-50">
                    <RotateCcw className="h-4 w-4" /> Return / Replace
                  </button>
                )}
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
