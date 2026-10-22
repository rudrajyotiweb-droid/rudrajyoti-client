"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandMark, Wordmark } from "@/components/brand/Logo";
import { Om, Ornament } from "@/components/ui/Ornament";
import { site } from "@/data/site";
import { api, ApiError, errorMessage } from "@/lib/api";
import { useSite } from "@/lib/site";
import type { Me } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store";

/** Only same-site paths are allowed as a post-login destination. */
function nextPath() {
  if (typeof window === "undefined") return "/account";
  const n = new URLSearchParams(window.location.search).get("next") ?? "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/account";
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [otpError, setOtpError] = useState("");
  const setSession = useAuth((x) => x.setSession);
  const signedIn = useAuth((x) => !!x.accessToken);
  const loginImage = useSite().pageImages.login;

  useEffect(() => {
    if (signedIn && step === "phone") router.replace(nextPath());
  }, [signedIn, step, router]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "otp" || timer === 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [step, timer]);

  const send = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Please enter a valid 10-digit mobile number");
    if (loading) return;
    setLoading(true);
    setOtpError("");
    try {
      const r = await api<{ resendIn: number }>("/auth/otp/send", { body: { phone }, auth: false });
      setStep("otp");
      setOtp(Array(6).fill(""));
      setTimer(r.resendIn ?? 30);
      setTimeout(() => refs.current[0]?.focus(), 300);
    } catch (e) {
      const wait = e instanceof ApiError && e.code === "OTP_COOLDOWN" ? (e.details as { retryAfter?: number } | undefined)?.retryAfter : undefined;
      if (wait && step === "otp") setTimer(wait);
      else if (step === "otp") setOtpError(errorMessage(e));
      else setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (code: string[]) => {
    const c = code.join("");
    if (c.length < 6 || loading) return;
    setLoading(true);
    setOtpError("");
    try {
      const r = await api<{ accessToken: string; refreshToken: string; user: Me }>("/auth/otp/verify", { body: { phone, code: c }, auth: false });
      setSession(r);
      router.replace(nextPath());
    } catch (e) {
      setOtpError(errorMessage(e));
      setOtp(Array(6).fill(""));
      setTimeout(() => refs.current[0]?.focus(), 50);
      setLoading(false);
    }
  };

  const onDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "");
    if (d.length > 1) {
      // pasted full code
      const next = d.slice(0, 6).split("");
      const filled = [...next, ...Array(6 - next.length).fill("")];
      setOtp(filled);
      refs.current[Math.min(5, next.length)]?.focus();
      return verify(filled);
    }
    const next = otp.map((x, k) => (k === i ? d : x));
    setOtp(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) verify(next);
  };

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-10 px-4 py-8 md:grid-cols-2 md:px-6">
      <div className="relative hidden h-[600px] overflow-hidden rounded-[2.5rem] md:block">
        <Image src={loginImage} alt="Ganga aarti at Varanasi" fill priority sizes="600px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a0606]/95 via-[#2a0606]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <Om className="text-5xl text-amber-200" />
          <p className="mt-4 font-serif text-3xl leading-snug">“Where there is devotion, there is the divine.”</p>
          <p className="mt-3 text-white/75">Sign in to book pujas, track your Aashirwad Box and watch your puja videos.</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto w-fit">
            <BrandMark priority className="h-24 w-24 drop-shadow-[0_10px_20px_rgb(201_150_43/0.35)]" />
          </motion.div>
          <h1 className="mt-4 text-ink-muted">
            <span className="block text-sm">Welcome to</span>
            <span className="sr-only">{site.name}</span>
            <Wordmark className="mx-auto mt-2 h-9" />
          </h1>
          <Ornament className="mx-auto mt-2" />
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-white p-6 shadow-[var(--shadow-lift)] md:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {step === "phone" ? (
              <motion.div key="phone" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <p className="font-semibold">Login or sign up</p>
                <p className="mt-1 text-sm text-ink-muted">We&apos;ll send a 6-digit OTP to your mobile.</p>
                <motion.div animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }} className={cn("mt-5 flex h-14 items-center overflow-hidden rounded-2xl border-2 bg-white transition focus-within:border-primary", error ? "border-primary" : "border-border")}>
                  <span className="flex h-full items-center gap-1.5 border-r border-border bg-bg px-4 text-sm font-medium">🇮🇳 +91</span>
                  <input
                    autoFocus
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setError(false);
                      setPhone(e.target.value.replace(/\D/g, ""));
                    }}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Mobile number"
                    className="h-full flex-1 px-4 text-lg tracking-wider outline-none"
                    aria-label="Mobile number"
                  />
                </motion.div>
                {error && <p className="mt-2 text-xs text-primary" role="alert">{error}</p>}
                <button onClick={send} disabled={loading} className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-white shadow-[var(--shadow-glow)] transition hover:bg-primary-dark disabled:opacity-60">
                  {loading ? <Spinner /> : <>Get OTP <ArrowRight className="h-4 w-4" /></>}
                </button>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                <button onClick={() => (setStep("phone"), setOtpError(""))} className="mb-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
                  <ArrowLeft className="h-4 w-4" /> Change number
                </button>
                <p className="font-semibold">Enter OTP</p>
                <p className="mt-1 text-sm text-ink-muted">Sent to +91 {phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</p>
                <div className="mt-5 flex justify-between gap-2">
                  {otp.map((d, i) => (
                    <motion.input
                      key={i}
                      ref={(el) => {
                        refs.current[i] = el;
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      value={d}
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      maxLength={6}
                      aria-label={`Digit ${i + 1}`}
                      onChange={(e) => onDigit(i, e.target.value)}
                      onKeyDown={(e) => e.key === "Backspace" && !d && i > 0 && refs.current[i - 1]?.focus()}
                      className={cn("h-14 w-full rounded-2xl border-2 text-center text-xl font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10", d ? "border-primary/60 bg-primary-soft/30" : "border-border")}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="mt-3 text-center text-sm text-primary" role="alert">
                    {otpError}
                  </p>
                )}
                <button onClick={() => verify(otp)} disabled={loading || otp.join("").length < 6} className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-white shadow-[var(--shadow-glow)] disabled:opacity-60">
                  {loading ? <Spinner /> : "Verify & Continue"}
                </button>
                <p className="mt-4 text-center text-sm text-ink-muted">
                  {timer > 0 ? (
                    <>
                      Resend OTP in <b className="tabular-nums text-ink">00:{String(timer).padStart(2, "0")}</b>
                    </>
                  ) : (
                    <button onClick={send} disabled={loading} className="font-semibold text-primary">
                      Resend OTP
                    </button>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
          <ShieldCheck className="h-4 w-4 text-success" /> By continuing you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}

const Spinner = () => <motion.span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />;
