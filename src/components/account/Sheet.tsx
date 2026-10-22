"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/** Bottom sheet on mobile, centered dialog on desktop. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="pb-safe fixed inset-x-0 bottom-0 z-[81] max-h-[90vh] overflow-y-auto rounded-t-3xl bg-bg p-5 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:p-7"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-sand md:hidden" />
            <div className="mb-5 flex items-center justify-between">
              <p className="font-serif text-xl font-semibold">{title}</p>
              <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand/60">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
