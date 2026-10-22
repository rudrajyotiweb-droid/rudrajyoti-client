"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/account/AccountShell";
import { ProductCard } from "@/components/cards/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { useHydrated, useProductsBySlug } from "@/lib/hooks";
import { useWishlist } from "@/store";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const slugs = useWishlist((s) => s.slugs);
  const { map, loading } = useProductsBySlug(hydrated ? slugs : []);
  const items = slugs.map((s) => map.get(s)).filter(Boolean);
  if (!hydrated || (loading && items.length === 0 && slugs.length > 0)) return <div className="skeleton h-72 rounded-3xl" />;
  if (items.length === 0) return <EmptyState icon={Heart} title="Your wishlist is empty" text="Tap the heart on any product to save it here." action={<ButtonLink href="/store">Browse shop</ButtonLink>} />;
  return (
    <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
      <AnimatePresence>
        {items.map((p) => (
          <motion.div key={p!.slug} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <ProductCard product={p!} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
