import { cn } from "@/lib/utils";

/** Small gold lotus divider used under section headings (BRD §9.4). */
export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 20" className={cn("h-4 w-36 text-accent", className)} aria-hidden="true">
      <path d="M2 10h52M106 10h52" stroke="currentColor" strokeWidth="1" />
      <circle cx="58" cy="10" r="1.6" fill="currentColor" />
      <circle cx="102" cy="10" r="1.6" fill="currentColor" />
      <path
        d="M80 2c3 3.4 4.4 6 4.4 8.6S83 15.6 80 18c-3-2.4-4.4-4.8-4.4-7.4S77 5.4 80 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M80 18c-4.6-.2-9.4-2.6-12-7 4.6-.6 8.6 1 12 7Zm0 0c4.6-.2 9.4-2.6 12-7-4.6-.6-8.6 1-12 7Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M80 18c-6.6 1-13-.6-17.4-4.8M80 18c6.6 1 13-.6 17.4-4.8" fill="none" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );
}

/** Om symbol drawn as text with a fallback font stack. */
export function Om({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif leading-none text-primary", className)} aria-hidden="true">
      ॐ
    </span>
  );
}

/** Animated diya used for success states and loaders. */
export function Diya({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-16 w-16", className)} aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd27a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flame" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="55%" stopColor="#ffb238" />
          <stop offset="100%" stopColor="#e2541b" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="24" r="20" fill="url(#glow)" className="animate-pulse" />
      <path
        d="M32 8c4 6 6 10 6 14a6 6 0 0 1-12 0c0-4 2-8 6-14Z"
        fill="url(#flame)"
        style={{ transformOrigin: "32px 30px" }}
        className="animate-flicker"
      />
      <path d="M8 36c4 12 14 18 24 18s20-6 24-18c-6 3-14 4-24 4S14 39 8 36Z" fill="#c9962b" />
      <path d="M8 36c6 3 14 4 24 4s18-1 24-4" stroke="#9a6f17" strokeWidth="1.5" fill="none" />
      <ellipse cx="32" cy="56" rx="14" ry="2.2" fill="#9a6f17" opacity="0.35" />
    </svg>
  );
}
