/**
 * Site settings from Admin → Settings (contact, fees, page images, How-it-works steps, bottom nav).
 * Plain module (no "use client") so server components get real values; the client side reads
 * the same object through <SiteProvider> (lib/site.tsx).
 */
import { site as brand } from "@/data/site";
import { serverTry } from "./api";
import type { SiteSettings } from "./types";

const local = (p: string) => `/assets/images/${p}.webp`;

/** Used when the API is unreachable — the page still renders with the bundled images. */
export const DEFAULT_SETTINGS: SiteSettings = {
  brand: { name: brand.name, tagline: brand.tagline, description: brand.description, phone: brand.phone, whatsapp: brand.whatsapp, email: brand.email, supportHours: "8 AM – 9 PM IST, all days", address: brand.address },
  stats: { pujas: 1200, devotees: 18000, temples: 24, rating: 4.8 },
  shipping: { freeShippingThreshold: brand.freeShippingThreshold, standardFee: 49, expressFee: 99, codEnabled: true, codFee: brand.codFee },
  tax: { pujaGst: 18 },
  bottomNav: [
    { icon: "House", label: "Home", link: "/" },
    { icon: "CalendarDays", label: "Puja", link: "/puja" },
    { icon: "Landmark", label: "Temple Puja", link: "/temples" },
    { icon: "ShoppingBag", label: "Store", link: "/store" },
    { icon: "User", label: "Account", link: "/account" },
  ],
  pageImages: {
    heroDeity: local("deity/shiva"),
    puja: local("puja/durga-aarti"),
    chadhava: local("hero/deep-daan"),
    temples: local("temple/somnath"),
    store: local("product/shankha-thali"),
    contact: local("temple/dakshineswar"),
    faq: local("puja/aarti"),
    howItWorks: local("temple/jagannath-puri"),
    about: local("temple/kashi-vishwanath"),
    aboutStory: local("puja/aarti"),
    login: local("hero/ganga-aarti"),
    policy: local("hero/temple-dusk"),
    appInstall: local("hero/ganga-aarti"),
  },
  howItWorks: [
    { title: "Choose your puja", desc: "Pick a puja or chadhava at a sacred temple and select the package that suits your family.", icon: "Flower2", image: local("puja/durga-aarti"), points: ["Pujas at Jyotirlingas, Shakti Peethas & Dhams", "Clear packages for 1 to 6 people"] },
    { title: "Share name & gotra", desc: "Fill in the names and gotra for the sankalp. Not sure of your gotra? We follow the shastra and use Kashyap.", icon: "ScrollText", image: local("puja/havan"), points: ["Pick saved family members in one tap", "Kashyap gotra used when unknown"] },
    { title: "Watch your puja", desc: "Temple pandits perform the rituals in your name. The puja video reaches your WhatsApp within 2–4 days.", icon: "Video", image: local("hero/ganga-aarti"), points: ["Performed by temple pandits", "Video on WhatsApp within 2–4 days"] },
    { title: "Receive Aashirwad", desc: "A blessed Aashirwad Box with prasad and sacred items arrives at your doorstep in 8–10 days.", icon: "Gift", image: local("chadhava/laddoo-bhog"), points: ["Prasad, raksha sutra & blessed items", "Delivered across India in 8–10 days"] },
  ],
};

/** Settings for server components (fetch is cached by Next for 60 s and shared within a request). */
export async function getSettings(): Promise<SiteSettings> {
  const s = await serverTry<Partial<SiteSettings>>("/site", {}, { revalidate: 60 });
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    pageImages: { ...DEFAULT_SETTINGS.pageImages, ...(s.pageImages ?? {}) },
    howItWorks: s.howItWorks?.length ? s.howItWorks : DEFAULT_SETTINGS.howItWorks,
    bottomNav: s.bottomNav?.length ? s.bottomNav : DEFAULT_SETTINGS.bottomNav,
  };
}

/** Global FAQs from Admin → Content → FAQs. */
export type Faq = { id: string; q: string; a: string; group: string };
export const getFaqs = () => serverTry<Faq[]>("/faqs", [], { revalidate: 120 });
