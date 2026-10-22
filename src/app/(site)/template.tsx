/**
 * App-like page transition on every navigation (BRD §8 "page transitions").
 * Pure CSS so the page never stays hidden if JS is slow; disabled by prefers-reduced-motion in globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-[page-in_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">{children}</div>;
}
