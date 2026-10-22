"use client";

import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Swipeable gallery with thumbnails and full-screen view (BRD §6.4.2). */
export function Gallery({ images, alt, ribbon }: { images: string[]; alt: string; ribbon?: string }) {
  const [ref, api] = useEmblaCarousel({ loop: true });
  const [idx, setIdx] = useState(0);
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (!api) return;
    const on = () => setIdx(api.selectedScrollSnap());
    api.on("select", on);
    return () => {
      api.off("select", on);
    };
  }, [api]);

  const go = useCallback((i: number) => api?.scrollTo(i), [api]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [full, images.length]);

  useEffect(() => {
    if (!full) api?.scrollTo(idx, true);
  }, [full, idx, api]);

  return (
    <div>
      <div className="group relative overflow-hidden rounded-3xl bg-sand shadow-[var(--shadow-lift)]">
        <div ref={ref} className="overflow-hidden">
          <div className="flex">
            {images.map((src, i) => (
              <div key={src} className="relative aspect-[4/3] min-w-0 flex-[0_0_100%]">
                <Image src={src} alt={`${alt} — image ${i + 1}`} fill priority={i === 0} sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        {ribbon && (
          <span className="absolute top-4 left-0 rounded-r-full bg-primary py-1.5 pr-4 pl-4 text-[0.68rem] font-bold tracking-wider text-white shadow-lg">{ribbon}</span>
        )}
        <button onClick={() => setFull(true)} aria-label="View full screen" className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60">
          <Expand className="h-4 w-4" />
        </button>
        {images.length > 1 && (
          <>
            <button onClick={() => api?.scrollPrev()} aria-label="Previous image" className="absolute top-1/2 left-3 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100 md:grid">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => api?.scrollNext()} aria-label="Next image" className="absolute top-1/2 right-3 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100 md:grid">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => go(i)} aria-label={`Go to image ${i + 1}`} className={cn("h-1.5 rounded-full transition-all duration-500", i === idx ? "w-6 bg-white" : "w-1.5 bg-white/60")} />
              ))}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 hidden gap-3 md:flex">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => go(i)}
              className={cn("relative h-16 w-20 overflow-hidden rounded-xl ring-2 transition", i === idx ? "ring-primary" : "opacity-70 ring-transparent hover:opacity-100")}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {full && (
          <motion.div className="fixed inset-0 z-[90] flex flex-col bg-black/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="pt-safe flex items-center justify-between p-4 text-white">
              <span className="text-sm">
                {idx + 1} / {images.length}
              </span>
              <button onClick={() => setFull(false)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={idx}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) setIdx((i) => (i + 1) % images.length);
                    if (info.offset.x > 80) setIdx((i) => (i - 1 + images.length) % images.length);
                  }}
                >
                  <Image src={images[idx]} alt={alt} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="pb-safe flex justify-center gap-2 p-4">
              {images.map((src, i) => (
                <button key={src} onClick={() => setIdx(i)} className={cn("relative h-14 w-14 overflow-hidden rounded-lg ring-2", i === idx ? "ring-white" : "opacity-50 ring-transparent")}>
                  <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
