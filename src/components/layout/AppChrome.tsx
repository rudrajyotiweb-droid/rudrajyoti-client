"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, Info, PlusSquare, Share, WifiOff, X, XCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";
import { track } from "@/lib/api";
import { useSite } from "@/lib/site";
import { cn, normalizePath } from "@/lib/utils";
import { useUi } from "@/store";
import { hideBottomNav } from "./BottomNav";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Global toast (add to cart, saved, etc.) */
export function Toast() {
  const toast = useUi((s) => s.toast);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  const Icon = toast?.tone === "error" ? XCircle : toast?.tone === "info" ? Info : CheckCircle2;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex justify-center px-4 md:top-auto md:bottom-6">
      <AnimatePresence>
        {visible && toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm text-white shadow-2xl"
            role="status"
          >
            <Icon className={cn("h-5 w-5", toast.tone === "error" ? "text-red-400" : "text-emerald-400")} />
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WhatsAppFab() {
  const pathname = usePathname();
  const { brand } = useSite();
  // focused flows (booking, checkout, login) have their own sticky CTA — keep them uncluttered
  if (hideBottomNav(pathname)) return null;
  const hasStickyBar = /^\/(puja|chadhava)\/[^/]+$|^\/store\/product\/|^\/cart$/.test(normalizePath(pathname));
  return (
    <motion.a
      href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent("Namaste, I need help with a puja booking.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className={cn(
        "fixed right-4 z-30 grid h-13 w-13 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgb(37_211_102/0.7)] md:right-6 md:bottom-6",
        hasStickyBar ? "bottom-[calc(9.5rem+var(--safe-bottom))]" : "bottom-[calc(5.5rem+var(--safe-bottom))]",
      )}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />
      <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4ZM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8Zm0-21.6A11.8 11.8 0 0 0 1.9 17.9L.2 24l6.3-1.6A11.8 11.8 0 1 0 12 .2Z" />
      </svg>
    </motion.a>
  );
}

/** Custom install prompt: Android (beforeinstallprompt) + iOS instructions sheet (BRD §8). */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    let captured: BIPEvent | null = null;
    // Manual trigger from the "Add to Home Screen" CTA
    const onManual = () => {
      if (!captured) setIos(true);
      setShow(true);
    };
    window.addEventListener("sm:install", onManual);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (standalone) return () => window.removeEventListener("sm:install", onManual);
    let dismissed = false;
    let visits = 1;
    try {
      dismissed = localStorage.getItem("sm-install-dismissed") === "1";
      visits = Number(localStorage.getItem("sm-visits") ?? 0) + 1;
      localStorage.setItem("sm-visits", String(visits));
    } catch {}
    const onPrompt = (e: Event) => {
      e.preventDefault();
      captured = e as BIPEvent;
      setEvt(captured);
      setIos(false);
      if (!dismissed && visits >= 2) setTimeout(() => setShow(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos && visits >= 2 && !dismissed) {
      setIos(true);
      setTimeout(() => setShow(true), 5000);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("sm:install", onManual);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("sm-install-dismissed", "1");
    } catch {}
  };

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div className="fixed inset-0 z-[65] bg-black/30 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={dismiss} />
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="pb-safe fixed inset-x-0 bottom-0 z-[66] rounded-t-3xl bg-bg p-5 shadow-2xl md:inset-x-auto md:right-6 md:bottom-24 md:w-96 md:rounded-3xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-sand md:hidden" />
            <button onClick={dismiss} aria-label="Dismiss" className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full hover:bg-sand/60">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-bg shadow-[var(--shadow-soft)] ring-1 ring-border">
                <BrandMark className="h-13 w-13" />
              </div>
              <div>
                <p className="font-serif text-lg font-semibold">Install {site.name}</p>
                <p className="text-sm text-ink-muted">Book pujas faster, get booking updates & works offline.</p>
              </div>
            </div>
            {ios ? (
              <ol className="mt-5 space-y-3 rounded-2xl bg-white p-4 text-sm">
                <li className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">1</span>
                  Tap <Share className="h-4 w-4 text-[#0a84ff]" /> <b>Share</b> in Safari
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">2</span>
                  Choose <PlusSquare className="h-4 w-4" /> <b>Add to Home Screen</b>
                </li>
              </ol>
            ) : (
              <div className="mt-5 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={dismiss}>
                  Not now
                </Button>
                <Button className="flex-1" onClick={install}>
                  <Download className="h-4 w-4" /> Install App
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function OfflineToast() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const on = () => setOffline(!navigator.onLine);
    on();
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          exit={{ y: -60 }}
          className="pt-safe fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 bg-ink py-2 text-xs text-white"
          role="status"
        >
          <WifiOff className="h-4 w-4" /> You are offline — showing saved pages
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    // anonymous traffic source, once per browser session (Admin → Reports)
    try {
      if (!sessionStorage.getItem("rj-visit")) {
        sessionStorage.setItem("rj-visit", "1");
        const utm = new URLSearchParams(window.location.search).get("utm_source")?.toLowerCase();
        const ref = document.referrer ? new URL(document.referrer).hostname : "";
        const standalone = window.matchMedia("(display-mode: standalone)").matches;
        const source = utm || (/whatsapp|wa\.me/.test(ref) ? "whatsapp" : /google\./.test(ref) ? "google" : /instagram/.test(ref) ? "instagram" : /facebook|fb\./.test(ref) ? "facebook" : /youtube/.test(ref) ? "youtube" : !ref || standalone ? "direct" : "other");
        track("visit", source);
      }
    } catch {
      /* storage blocked */
    }
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
