"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Check,
  CheckCircle2,
  Gift,
  Lock,
  MapPin,
  Package,
  Plus,
  Share2,
  Tag,
  Trash2,
  UserPlus,
  Users,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Diya, Ornament } from "@/components/ui/Ornament";
import { Field, QtyStepper, inputCls } from "@/components/ui/misc";
import { IstDate } from "@/components/ui/IstDate";
import { api, errorMessage, track } from "@/lib/api";
import { useHydrated } from "@/lib/hooks";
import { runPayment } from "@/lib/payment";
import { useSite } from "@/lib/site";
import type { CheckoutInfo, PujaDetail } from "@/lib/types";
import { cn, formatDateIST, formatINR } from "@/lib/utils";
import { toast, useAuth } from "@/store";

const STEPS = ["Package", "Sankalp", "Add-ons", "Review & Pay"] as const;

type Participant = { name: string };
type State = {
  pkg: string;
  whatsapp: string;
  participants: Participant[];
  gotra: string;
  unknownGotra: boolean;
  wish: string;
  box: boolean;
  addressId: string;
  addons: Record<string, number>;
  coupon: string;
  couponApplied: boolean;
};

export function BookingFlow({ puja }: { puja: PujaDetail }) {
  const slug = puja.slug;
  const initialPkg = useSearchParams().get("pkg") ?? undefined;
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useAuth((x) => x.user);
  const reloadUser = useAuth((x) => x.reload);
  const settings = useSite();
  const GST_RATE = (settings.tax?.pujaGst ?? 18) / 100;
  const templeName = puja.temple?.name ?? "";
  const pkgs = puja.packages;
  const addOns = puja.addOns;
  const storeKey = `sm-booking-${slug}`;
  const family = user?.family ?? [];
  const addresses = user?.addresses ?? [];

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState<{ code: string; total: number } | null>(null);
  const [paying, setPaying] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponBusy, setCouponBusy] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [s, setS] = useState<State>(() => ({
    pkg: initialPkg && pkgs.some((p) => p.id === initialPkg) ? initialPkg : (pkgs.find((p) => p.popular)?.id ?? pkgs[0]?.id ?? ""),
    whatsapp: "",
    participants: [{ name: "" }],
    gotra: "",
    unknownGotra: false,
    wish: "",
    box: true,
    addressId: "",
    addons: {},
    coupon: "",
    couponApplied: false,
  }));

  // prefill from the signed-in profile (never overwrites what the devotee already typed)
  useEffect(() => {
    if (!user) return;
    setS((x) => ({
      ...x,
      whatsapp: x.whatsapp || user.phone,
      participants: x.participants.map((p, i) => (i === 0 && !p.name.trim() ? { name: user.name } : p)),
      gotra: x.gotra || user.gotra,
      addressId: x.addressId && user.addresses.some((a) => a.id === x.addressId) ? x.addressId : (user.addresses.find((a) => a.default)?.id ?? user.addresses[0]?.id ?? ""),
    }));
  }, [user]);

  // fresh family / addresses (the user may have just added one)
  useEffect(() => {
    void reloadUser();
  }, [reloadUser]);

  // persist progress so a refresh / app switch doesn't lose it (BRD §6.5)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storeKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setS((x) => ({ ...x, ...parsed.s, pkg: initialPkg ?? parsed.s.pkg }));
        setStep(useAuth.getState().user ? (parsed.step ?? 0) : 0);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(storeKey, JSON.stringify({ s, step }));
    } catch {}
  }, [s, step, storeKey]);

  const pkg = pkgs.find((p) => p.id === s.pkg) ?? pkgs[0];
  const set = <K extends keyof State>(k: K, v: State[K]) => setS((x) => ({ ...x, [k]: v }));

  // names count must equal package persons (BRD §13.2)
  useEffect(() => {
    setS((x) => {
      const n = pkg.persons;
      if (x.participants.length === n) return x;
      const next = x.participants.slice(0, n);
      while (next.length < n) next.push({ name: "" });
      return { ...x, participants: next };
    });
  }, [pkg.persons]);

  const addonTotal = Object.entries(s.addons).reduce((t, [id, q]) => t + (addOns.find((a) => a.id === id)?.price ?? 0) * q, 0);
  const subtotal = pkg.price + addonTotal;
  const discount = s.couponApplied ? couponDiscount : 0;
  const taxable = Math.round((subtotal - discount) / (1 + GST_RATE));
  const gst = subtotal - discount - taxable;
  const total = subtotal - discount;

  const sankalpValid = /^\d{10}$/.test(s.whatsapp.replace(/\s/g, "")) && s.participants.every((p) => p.name.trim().length > 1) && (s.unknownGotra || s.gotra.trim().length > 1);
  const boxValid = !s.box || addresses.some((a) => a.id === s.addressId);
  const canNext = step === 1 ? sankalpValid && boxValid : !!pkg;

  // the server re-checks the coupon on payment; re-validate whenever the amount changes
  useEffect(() => {
    if (!s.couponApplied || !user) return;
    let live = true;
    api<{ discount: number }>("/checkout/coupon", { body: { code: s.coupon.trim(), kind: "Puja", subtotal } })
      .then((r) => live && setCouponDiscount(r.discount))
      .catch((e) => {
        if (!live) return;
        setS((x) => ({ ...x, couponApplied: false }));
        toast(errorMessage(e), "error");
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, s.couponApplied]);

  const applyCoupon = async () => {
    const code = s.coupon.trim();
    if (!code) return;
    if (!user) return toast("Please sign in to use a coupon", "info");
    setCouponBusy(true);
    try {
      const r = await api<{ discount: number }>("/checkout/coupon", { body: { code, kind: "Puja", subtotal } });
      setCouponDiscount(r.discount);
      set("couponApplied", true);
      toast(`Coupon applied — you save ${formatINR(r.discount)}`);
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setCouponBusy(false);
    }
  };

  const go = (n: number) => {
    // sign in before the sankalp (BRD §6.5.2); the selection survives in sessionStorage
    if (n >= 1 && !user) {
      router.push(`/login?next=${encodeURIComponent(`/puja/${slug}/book?pkg=${s.pkg}`)}`);
      return;
    }
    if (step === 1 && n === 2) track("sankalp_filled");
    setDir(n > step ? 1 : -1);
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finish = (code: string, amount: number) => {
    setDone({ code, total: amount });
    try {
      sessionStorage.removeItem(storeKey);
    } catch {}
    window.scrollTo({ top: 0 });
  };

  const pay = async () => {
    if (paying) return;
    setPaying(true);
    try {
      // a failed attempt can be retried on the same booking instead of creating a new one
      const res = pendingCode
        ? await api<{ code: string; amount: number; checkout: CheckoutInfo }>("/checkout/retry", { body: { code: pendingCode } })
        : await api<{ code: string; amount: number; checkout: CheckoutInfo }>("/checkout/puja", {
            body: {
              pujaSlug: slug,
              packageId: pkg.id,
              participants: s.participants.map((p) => p.name.trim()),
              gotra: s.unknownGotra ? "" : s.gotra.trim(),
              unknownGotra: s.unknownGotra,
              whatsapp: s.whatsapp,
              wish: s.wish.trim(),
              box: s.box,
              ...(s.box ? { addressId: s.addressId } : {}),
              addOns: Object.entries(s.addons)
                .filter(([, q]) => q > 0)
                .map(([id, qty]) => ({ id, qty })),
              ...(s.couponApplied ? { coupon: s.coupon.trim() } : {}),
            },
          });
      setPendingCode(res.code);
      const result = await runPayment(res.checkout, settings.brand.name);
      if (!result || result.status === "success") return finish(res.code, res.amount);
      if (result.status === "pending") return router.push(`/payment/status?orderId=${encodeURIComponent(result.orderId)}`);
      toast(result.message ? `Payment failed: ${result.message}. You can try again.` : "Payment failed. You can try again.", "error");
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setPaying(false);
    }
  };

  if (done) return <Success id={done.code} pujaTitle={puja.title} date={puja.date} temple={templeName} total={done.total} />;
  if (!pkg) return null;
  if (!puja.bookingOpen)
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-serif text-2xl font-semibold">Booking for this puja has closed</p>
        <Link href="/puja" className="mt-4 inline-block font-medium text-primary hover:underline">
          See upcoming pujas
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-40 md:px-6 md:pt-8 lg:pb-16">
      {/* Header + progress */}
      <div className="flex items-center gap-3">
        <Link href={`/puja/${slug}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-white" aria-label="Back to puja">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-serif text-lg font-semibold md:text-xl">{puja.title}</p>
          <p className="truncate text-xs text-ink-muted">
            {templeName && `${templeName} · `}<IstDate iso={puja.date} opts={{ weekday: "short", day: "numeric", month: "short" }} />
          </p>
        </div>
      </div>

      <ol className="mt-6 grid grid-cols-4 gap-2">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button onClick={() => i < step && go(i)} disabled={i > step} className="w-full text-left">
              <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                <motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }} transition={{ duration: 0.5 }} />
              </div>
              <p className={cn("mt-2 flex items-center gap-1 text-[0.7rem] font-medium md:text-sm", i <= step ? "text-primary" : "text-ink-muted")}>
                {i < step && <Check className="h-3.5 w-3.5" />} {label}
              </p>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="relative min-w-0">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <StepCard title="Select your package" subtitle="The number of names in the sankalp depends on the package.">
                  <div className="grid gap-3">
                    {pkgs.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => set("pkg", p.id)}
                        className={cn("flex items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition", s.pkg === p.id ? "border-primary shadow-[var(--shadow-glow)]" : "border-border hover:border-primary/40")}
                      >
                        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", s.pkg === p.id ? "bg-primary text-white" : "bg-primary-soft text-primary")}>
                          <Users className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 font-semibold">
                            {p.name} {p.popular && <span className="rounded-full bg-accent px-2 py-0.5 text-[0.6rem] text-white">POPULAR</span>}
                          </span>
                          <span className="text-xs text-ink-muted">
                            {p.persons} {p.persons > 1 ? "persons" : "person"} · {p.desc}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block font-semibold text-primary">{formatINR(p.price)}</span>
                          {p.strike && <span className="text-xs text-ink-muted line-through">{formatINR(p.strike)}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                </StepCard>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <StepCard title="Sankalp details" subtitle="These names and gotra will be recited by the pandit during the sankalp.">
                    <Field label="WhatsApp number" hint="We'll send booking updates and the puja video here.">
                      <div className="flex">
                        <span className="grid h-12 place-items-center rounded-l-xl border border-r-0 border-border bg-bg px-3 text-sm">+91</span>
                        <input inputMode="numeric" maxLength={10} value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))} className={cn(inputCls, "rounded-l-none")} />
                      </div>
                    </Field>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium">
                          Names of participants <span className="text-ink-muted">({pkg.persons})</span>
                        </p>
                      </div>
                      <div className="space-y-2.5">
                        {s.participants.map((p, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2">
                            <span className="grid h-12 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-sm font-semibold text-primary">{i + 1}</span>
                            <input
                              value={p.name}
                              placeholder={i === 0 ? "Your full name" : `Participant ${i + 1} name`}
                              onChange={(e) => set("participants", s.participants.map((x, k) => (k === i ? { name: e.target.value } : x)))}
                              className={inputCls}
                            />
                          </motion.div>
                        ))}
                      </div>
                      <p className="mt-3 mb-2 text-xs font-medium text-ink-muted">Pick from saved family members</p>
                      <div className="flex flex-wrap gap-2">
                        {hydrated && family.length === 0 && (
                          <Link href="/account/family" className="text-xs font-medium text-primary hover:underline">
                            + Save family members for faster booking
                          </Link>
                        )}
                        {family.map((f) => {
                          const used = s.participants.some((p) => p.name === f.name);
                          return (
                            <button
                              key={f.id}
                              disabled={used}
                              onClick={() => {
                                const idx = s.participants.findIndex((p) => !p.name.trim());
                                if (idx === -1) return;
                                set("participants", s.participants.map((x, k) => (k === idx ? { name: f.name } : x)));
                              }}
                              className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition", used ? "border-success/40 bg-success/10 text-success" : "border-border bg-white hover:border-primary hover:text-primary")}
                            >
                              {used ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />} {f.name} · {f.relation}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5">
                      <Field label="Gotra">
                        <input value={s.unknownGotra ? "Kashyap" : s.gotra} disabled={s.unknownGotra} onChange={(e) => set("gotra", e.target.value)} placeholder="e.g. Bharadwaj" className={cn(inputCls, s.unknownGotra && "bg-bg text-ink-muted")} />
                      </Field>
                      <label className="mt-2.5 flex cursor-pointer items-center gap-2.5 text-sm">
                        <input type="checkbox" checked={s.unknownGotra} onChange={(e) => set("unknownGotra", e.target.checked)} className="h-4.5 w-4.5 accent-primary" />
                        I don&apos;t know my gotra <span className="text-xs text-ink-muted">(Kashyap gotra will be used as per shastra)</span>
                      </label>
                    </div>

                    <Field label="Your wish / prayer (optional)" className="mt-5" hint={`${s.wish.length}/250`}>
                      <textarea value={s.wish} maxLength={250} rows={3} onChange={(e) => set("wish", e.target.value)} placeholder="e.g. For my father's good health" className={cn(inputCls, "h-auto py-3")} />
                    </Field>
                  </StepCard>

                  <StepCard
                    title="Aashirwad Box"
                    subtitle="Prasad and blessed items from the puja, delivered free in 8–10 days."
                    action={
                      <button
                        role="switch"
                        aria-checked={s.box}
                        onClick={() => set("box", !s.box)}
                        className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", s.box ? "bg-primary" : "bg-sand")}
                        aria-label="Receive Aashirwad Box"
                      >
                        <motion.span layout className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow", s.box ? "right-1" : "left-1")} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                      </button>
                    }
                  >
                    <AnimatePresence initial={false}>
                      {s.box && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {addresses.map((a) => (
                              <button
                                key={a.id}
                                onClick={() => set("addressId", a.id)}
                                className={cn("rounded-2xl border-2 bg-white p-4 text-left text-sm transition", s.addressId === a.id ? "border-primary" : "border-border")}
                              >
                                <span className="flex items-center gap-2 font-semibold">
                                  <MapPin className="h-4 w-4 text-primary" /> {a.label}
                                  {s.addressId === a.id && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                                </span>
                                <span className="mt-1 block text-ink-muted">
                                  {a.line}, {a.city} – {a.pin}
                                </span>
                                <span className="mt-2 inline-flex items-center gap-1 text-xs text-success">
                                  <Check className="h-3 w-3" /> Delivery available
                                </span>
                              </button>
                            ))}
                            <Link href={`/account/addresses?next=${encodeURIComponent(`/puja/${slug}/book?pkg=${s.pkg}`)}`} className="grid place-items-center rounded-2xl border-2 border-dashed border-border p-4 text-sm font-medium text-primary hover:border-primary">
                              <span className="flex items-center gap-1">
                                <Plus className="h-4 w-4" /> Add new address
                              </span>
                            </Link>
                          </div>
                          {!boxValid && <p className="mt-3 text-sm text-primary">Add a delivery address to receive the Aashirwad Box, or turn it off.</p>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </StepCard>
                </div>
              )}

              {step === 2 && (
                <StepCard title="Add-on offerings" subtitle="Optional sevas offered in your name along with the puja.">
                  <div className="grid gap-3">
                    {addOns.length === 0 && <p className="text-sm text-ink-muted">No add-on offerings for this puja. Continue to review.</p>}
                    {addOns
                      .map((a) => {
                        const q = s.addons[a.id] ?? 0;
                        return (
                          <div key={a.id} className={cn("flex items-center gap-3 rounded-2xl border bg-white p-3 transition", q > 0 ? "border-primary/60 bg-primary-soft/30" : "border-border")}>
                            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                              <Image src={a.image} alt="" fill sizes="64px" className="object-cover" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold">{a.name}</span>
                              <span className="line-clamp-2 text-xs text-ink-muted">{a.desc}</span>
                              <span className="mt-0.5 block text-sm font-semibold text-primary">{formatINR(a.price)}</span>
                            </span>
                            {q === 0 ? (
                              <button onClick={() => set("addons", { ...s.addons, [a.id]: 1 })} className="h-9 rounded-full border border-primary px-4 text-sm font-medium text-primary transition hover:bg-primary hover:text-white">
                                Add
                              </button>
                            ) : (
                              <QtyStepper size="sm" value={q} onChange={(v) => set("addons", { ...s.addons, [a.id]: v })} max={11} />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </StepCard>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <StepCard title="Review your booking">
                    <dl className="divide-y divide-border text-sm">
                      <Row k="Puja" v={puja.title} />
                      <Row k="Package" v={`${pkg.name} (${pkg.persons})`} />
                      <Row k="Names" v={s.participants.map((p) => p.name).join(", ")} />
                      <Row k="Gotra" v={s.unknownGotra ? "Kashyap" : s.gotra} />
                      <Row k="WhatsApp" v={`+91 ${s.whatsapp}`} />
                      <Row k="Aashirwad Box" v={s.box ? `Yes — ${addresses.find((a) => a.id === s.addressId)?.label ?? ""}` : "No"} />
                      {s.wish && <Row k="Wish" v={s.wish} />}
                    </dl>
                    <button onClick={() => go(1)} className="mt-3 text-sm font-medium text-primary hover:underline">
                      Edit details
                    </button>
                  </StepCard>

                  <StepCard title="Payment">
                    <div className="flex items-center gap-3 rounded-2xl border-2 border-primary bg-white p-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <span className="text-sm">
                        <span className="block font-semibold">Pay securely with Paytm</span>
                        <span className="text-xs text-ink-muted">UPI (GPay, PhonePe, Paytm) · Credit & debit cards · Netbanking · Wallets</span>
                      </span>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
                      <Lock className="h-3.5 w-3.5 text-success" /> Payments are processed by Paytm. 100% refund if the puja is not performed.
                    </p>
                  </StepCard>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-soft)]">
            <div className="flex gap-3 border-b border-border p-4">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image src={puja.images[0]} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold">{puja.title}</p>
                <p className="text-xs text-ink-muted">{pkg.name}</p>
              </div>
            </div>
            <div className="space-y-2 p-4 text-sm">
              <Line k={pkg.name} v={formatINR(pkg.price)} />
              {Object.entries(s.addons)
                .filter(([, q]) => q > 0)
                .map(([id, q]) => {
                  const a = addOns.find((x) => x.id === id)!;
                  return (
                    <div key={id} className="flex items-center justify-between gap-2 text-ink-muted">
                      <span className="flex items-center gap-1">
                        {a.name} × {q}
                        <button onClick={() => set("addons", { ...s.addons, [id]: 0 })} aria-label={`Remove ${a.name}`}>
                          <Trash2 className="h-3.5 w-3.5 hover:text-primary" />
                        </button>
                      </span>
                      <span>{formatINR(a.price * q)}</span>
                    </div>
                  );
                })}
              {s.box && <Line k="Aashirwad Box & delivery" v={<span className="text-success">FREE</span>} />}

              <div className="pt-2">
                {s.couponApplied ? (
                  <div className="flex items-center justify-between rounded-xl bg-success/10 px-3 py-2 text-success">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <Tag className="h-3.5 w-3.5" /> {s.coupon.toUpperCase()} applied
                    </span>
                    <button onClick={() => setS((x) => ({ ...x, couponApplied: false, coupon: "" }))} className="text-xs underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={s.coupon} onChange={(e) => set("coupon", e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && applyCoupon()} placeholder="Coupon code" className={cn(inputCls, "h-10 text-sm")} />
                    <button onClick={applyCoupon} disabled={couponBusy || !s.coupon.trim()} className="h-10 rounded-xl bg-ink px-4 text-xs font-semibold text-white disabled:opacity-50">
                      {couponBusy ? "…" : "Apply"}
                    </button>
                  </div>
                )}
              </div>
              {discount > 0 && <Line k="Coupon discount" v={<span className="text-success">−{formatINR(discount)}</span>} />}
              <div className="border-t border-dashed border-border pt-2 text-xs text-ink-muted">
                <Line k="Taxable value" v={formatINR(taxable)} />
                <Line k="GST (18%, included)" v={formatINR(gst)} />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <motion.span key={total} initial={{ scale: 1.15, color: "#9e1c1c" }} animate={{ scale: 1, color: "#d32f2f" }}>
                  {formatINR(total)}
                </motion.span>
              </div>
            </div>
            <div className="hidden p-4 pt-0 lg:block">
              <FooterButtons step={step} canNext={canNext} paying={paying} total={total} onBack={() => go(step - 1)} onNext={() => (step === 3 ? pay() : go(step + 1))} />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 pt-3 backdrop-blur-xl lg:hidden">
        <FooterButtons step={step} canNext={canNext} paying={paying} total={total} onBack={() => go(step - 1)} onNext={() => (step === 3 ? pay() : go(step + 1))} />
      </div>
    </div>
  );
}

function FooterButtons({ step, canNext, paying, total, onBack, onNext }: { step: number; canNext: boolean; paying: boolean; total: number; onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex gap-2 pb-2">
      {step > 0 && (
        <button onClick={onBack} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-white" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={onNext}
        disabled={!canNext || paying}
        className="relative inline-flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary font-medium text-white shadow-[var(--shadow-glow)] transition hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
      >
        {paying ? (
          <>
            <motion.span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
            Processing…
          </>
        ) : step === 3 ? (
          <>
            <Lock className="h-4 w-4" /> Pay {formatINR(total)}
          </>
        ) : (
          <>
            Continue <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}

function StepCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-soft)] md:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold md:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex gap-4 py-2.5">
    <dt className="w-28 shrink-0 text-ink-muted">{k}</dt>
    <dd className="font-medium">{v}</dd>
  </div>
);
const Line = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-2">
    <span>{k}</span>
    <span>{v}</span>
  </div>
);

function Petals() {
  const petals = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ left: (i * 41) % 100, delay: (i % 9) * 0.25, dur: 3.5 + (i % 5) * 0.6, rot: (i * 47) % 360, hue: i % 3 })), []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute -top-8 h-4 w-3 rounded-[60%_40%_60%_40%]"
          style={{ left: `${p.left}%`, background: ["#f59e0b", "#d32f2f", "#fb923c"][p.hue] }}
          initial={{ y: -40, rotate: p.rot, opacity: 0 }}
          animate={{ y: "110vh", rotate: p.rot + 360, opacity: [0, 1, 1, 0], x: [0, 30, -20, 10] }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

function Success({ id, pujaTitle, date, temple, total }: { id: string; pujaTitle: string; date: string; temple: string; total: number }) {
  const ics = () => {
    const d = new Date(date);
    const fmt = (x: Date) => x.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Rudra Jyoti//Puja//EN",
      "BEGIN:VEVENT",
      `UID:${id}@rudrajyoti`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(d)}`,
      `DTEND:${fmt(new Date(d.getTime() + 2 * 3600_000))}`,
      `SUMMARY:${pujaTitle}`,
      `LOCATION:${temple}`,
      `DESCRIPTION:Booking ${id}. Light a diya at home and chant during the puja.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const share = `https://wa.me/?text=${encodeURIComponent(`I have booked ${pujaTitle} at ${temple} through Rudra Jyoti 🙏`)}`;
  const timeline = [
    ["Booking confirmed", "Just now", true],
    ["Sankalp confirmed", "Within 24 hours", false],
    ["Puja performed", formatDateIST(date, { weekday: undefined, day: "numeric", month: "short" }), false],
    ["Video on WhatsApp", "2–4 days after puja", false],
    ["Aashirwad Box delivered", "8–10 days", false],
  ] as const;

  return (
    <div className="mandala-bg relative mx-auto max-w-xl px-4 pt-10 pb-24 text-center">
      <Petals />
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 14 }} className="mx-auto w-fit">
        <Diya className="h-28 w-28" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 font-serif text-3xl font-semibold text-primary">
        Your puja is booked!
      </motion.h1>
      <Ornament className="mx-auto mt-2" />
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-3 text-ink-muted">
        May the divine bless you and your family. Confirmation has been sent to your WhatsApp.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 rounded-3xl border border-border bg-white p-5 text-left shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-dashed border-border pb-4">
          <div>
            <p className="text-xs text-ink-muted">Booking ID</p>
            <p className="font-mono text-lg font-semibold">{id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-muted">Amount paid</p>
            <p className="text-lg font-semibold text-primary">{formatINR(total)}</p>
          </div>
        </div>
        <p className="mt-4 mb-3 text-sm font-semibold">What happens next</p>
        <ol className="space-y-0">
          {timeline.map(([t, when, ok], i) => (
            <motion.li key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.12 }} className="relative flex gap-3 pb-4 last:pb-0">
              {i < timeline.length - 1 && <span className="absolute top-6 left-[0.68rem] h-full w-px bg-border" />}
              <span className={cn("relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full", ok ? "bg-success text-white" : "border-2 border-border bg-white")}>
                {ok ? <Check className="h-3.5 w-3.5" /> : i === 4 ? <Package className="h-3 w-3 text-ink-muted" /> : null}
              </span>
              <span className="text-sm">
                <b className="block font-medium">{t}</b>
                <span className="text-xs text-ink-muted">{when}</span>
              </span>
            </motion.li>
          ))}
        </ol>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button onClick={ics} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-primary bg-white text-sm font-medium text-primary transition hover:bg-primary hover:text-white">
          <CalendarPlus className="h-4 w-4" /> Add to calendar
        </button>
        <a href={share} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-white">
          <Share2 className="h-4 w-4" /> Share
        </a>
      </div>
      <div className="mt-4 flex justify-center gap-6 text-sm">
        <Link href="/account/bookings" className="font-medium text-primary hover:underline">
          View my bookings
        </Link>
        <Link href="/store" className="flex items-center gap-1 font-medium text-ink-muted hover:text-primary">
          <Gift className="h-4 w-4" /> Shop puja samagri
        </Link>
      </div>
    </div>
  );
}
