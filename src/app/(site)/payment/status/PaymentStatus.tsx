"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { PaymentResult } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/store";

/** Confirms a payment with the server. Paytm redirects here when its overlay could not return to the page. */
export function PaymentStatus() {
  const orderId = useSearchParams().get("orderId") ?? "";
  const signedIn = useAuth((s) => !!s.accessToken);
  const [r, setR] = useState<PaymentResult | null>(null);
  const [err, setErr] = useState("");
  const tries = useRef(0);

  const check = useCallback(async () => {
    if (!orderId) return setErr("Missing payment reference.");
    try {
      const res = await api<PaymentResult>(`/payments/${encodeURIComponent(orderId)}`);
      setR(res);
      setErr("");
      return res;
    } catch (e) {
      setErr(errorMessage(e));
    }
  }, [orderId]);

  // poll while the bank is still confirming (up to ~2 minutes)
  useEffect(() => {
    if (!signedIn) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = async () => {
      const res = await check();
      if (res?.status === "pending" && tries.current++ < 24) t = setTimeout(loop, 5000);
    };
    void loop();
    return () => clearTimeout(t);
  }, [check, signedIn]);

  if (!signedIn)
    return (
      <Shell icon={<Clock className="h-14 w-14 text-accent" />} title="Please sign in to see your payment">
        <Link href={`/login?next=${encodeURIComponent(`/payment/status?orderId=${orderId}`)}`} className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-8 font-medium text-white">
          Sign in
        </Link>
      </Shell>
    );

  if (err && !r)
    return (
      <Shell icon={<XCircle className="h-14 w-14 text-primary" />} title="We couldn't check this payment" text={err}>
        <button onClick={() => void check()} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 font-medium text-white">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </Shell>
    );

  if (!r) return <div className="mx-auto mt-16 h-72 max-w-md rounded-3xl skeleton" />;

  const isStore = r.kind === "Store";
  const listHref = isStore ? "/account/orders" : "/account/bookings";

  if (r.status === "success")
    return (
      <Shell icon={<CheckCircle2 className="h-16 w-16 text-success" />} title={isStore ? "Order placed!" : "Your booking is confirmed!"} text={`${r.title ? r.title + " · " : ""}${r.refCode} · ${formatINR(r.amount)} paid`}>
        <Link href={listHref} className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-8 font-medium text-white">
          {isStore ? "View my orders" : "View my bookings"}
        </Link>
      </Shell>
    );

  if (r.status === "pending")
    return (
      <Shell icon={<Clock className="h-14 w-14 animate-pulse text-accent" />} title="Confirming your payment…" text="Your bank is still confirming the payment. This page updates automatically — please don't pay again.">
        <button onClick={() => void check()} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full border border-border bg-white px-8 font-medium">
          <RefreshCw className="h-4 w-4" /> Check now
        </button>
      </Shell>
    );

  return (
    <Shell icon={<XCircle className="h-14 w-14 text-primary" />} title={r.status === "refunded" ? "Payment refunded" : "Payment failed"} text={r.status === "refunded" ? "This payment was refunded to your original payment method." : `${r.message ?? "The payment did not go through."} If money was deducted, it is refunded automatically by your bank.`}>
      <Link href={isStore ? "/cart" : listHref} className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-8 font-medium text-white">
        {isStore ? "Back to cart" : "My bookings"}
      </Link>
    </Shell>
  );
}

function Shell({ icon, title, text, children }: { icon: React.ReactNode; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto w-fit">
        {icon}
      </motion.div>
      <h1 className="mt-5 font-serif text-2xl font-semibold">{title}</h1>
      {text && <p className="mt-2 text-ink-muted">{text}</p>}
      {children}
    </div>
  );
}
