import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "white" | "soft";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none overflow-hidden";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[var(--shadow-glow)] hover:bg-primary-dark hover:shadow-[0_14px_34px_-12px_rgb(211_47_47/0.7)] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent hover:before:translate-x-full before:transition-transform before:duration-700",
  outline: "border border-primary/70 text-primary bg-white/60 backdrop-blur hover:bg-primary hover:text-white",
  ghost: "text-ink hover:bg-sand/60",
  white: "bg-white text-primary hover:bg-bg shadow-[var(--shadow-soft)]",
  soft: "bg-primary-soft text-primary hover:bg-primary hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
