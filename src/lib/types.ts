/** Shapes returned by the Rudra Jyoti API (backend/src/routes/serializers.js). */

export type TempleCardT = { id: string; slug: string; name: string; city: string; state: string; deity: string; image: string; short?: string };

export type Temple = TempleCardT & {
  gallery: string[];
  short: string;
  history: string[];
  timings: string;
  mapQuery: string;
};

export type TempleDetail = Temple & { pujas: PujaCardT[]; chadhavas: ChadhavaCardT[] };

export type PujaPackage = { id: string; name: string; persons: number; price: number; strike?: number; popular?: boolean; desc: string };
export type AddOn = { id: string; name: string; price: number; desc: string; image: string };

export type PujaCardT = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  ribbon?: string;
  deity: string;
  purposes: string[];
  templeSlug: string;
  temple: TempleCardT | null;
  date: string;
  cutoff: string;
  tithi: string;
  images: string[];
  devotees: number;
  featured?: boolean;
  status: string;
  bookingOpen: boolean;
  startingPrice: number;
};

export type Review = { id: string; name: string; city?: string; rating: number; text: string; target?: string; kind?: string; reply?: string; date: string; isDemo?: boolean };

export type Puja = PujaCardT & {
  about: { q: string; a: string }[];
  benefits: { title: string; desc: string; icon: string }[];
  process: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  packages: PujaPackage[];
  addOns: AddOn[];
  boxContents?: string;
};

export type PujaDetail = Omit<Puja, "temple"> & { temple: Temple | null; reviews: Review[]; related: PujaCardT[] };

export type ChadhavaItem = { id: string; name: string; price: number; image: string; desc: string; available?: number | null };

export type ChadhavaCardT = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  templeSlug: string;
  temple: TempleCardT | null;
  date: string;
  cutoff?: string;
  tithi: string;
  image: string;
  devotees: number;
  status: string;
  bookingOpen: boolean;
  startingPrice: number;
  items?: ChadhavaItem[];
};

export type Chadhava = ChadhavaCardT & { about: string; items: ChadhavaItem[] };
export type ChadhavaDetailT = Omit<Chadhava, "temple"> & { temple: Temple | null };

export type Category = { id: string; slug: string; name: string; icon: string; image: string; parent: string | null; products?: number; fromPrice?: number | null };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  gst?: number;
  rating: number;
  reviews: number;
  images: string[];
  short: string;
  description: string;
  specs: [string, string][];
  howToUse?: string;
  variants?: { label: string; options: string[] };
  badge?: string;
  bestseller?: boolean;
  stock: number;
};

export type ProductDetailT = Product & { related: Product[]; reviewList: Review[] };

export type IconItem = { icon: string; line1: string; line2: string };
export type SectionId = "quick" | "promo" | "upcoming" | "temples" | "products" | "chadhava" | "why" | "reviews" | "app";
export type HomeSection = { id: SectionId; title: string; link?: string; visible: boolean };

export type HomeData = {
  hero: { line1: string; line2: string; text: string; ctaLabel: string; ctaLink: string; trust: IconItem[] };
  sections: HomeSection[];
  quickLinks: { icon: string; title: string; sub: string; link: string }[];
  upcoming: { count: number; source: "By date" | "Featured first" };
  templeSlugs: string[];
  productTiles: { label: string; link: string; image: string; category: string; fromPrice: number | null }[];
  why: IconItem[];
  bottomNav: { icon: string; label: string; link: string }[];
  heroSlides: { id: string; image: string; caption: string; link?: string }[];
  promos: { id: string; title: string; subtitle: string; tagline?: string; pujaSlug?: string; image: string; link: string }[];
  upcomingPujas: PujaCardT[];
  temples: Temple[];
  chadhavas: ChadhavaCardT[];
  reviews: Review[];
  stats: SiteStats;
};

export type SiteStats = { pujas: number; devotees: number; temples: number; rating: number };

export type SiteSettings = {
  brand: { name: string; tagline: string; description: string; phone: string; whatsapp: string; email: string; supportHours: string; address: string; logo?: string; wordmark?: string };
  stats: SiteStats;
  shipping: { freeShippingThreshold: number; standardFee: number; expressFee: number; codEnabled: boolean; codFee: number };
  tax: { pujaGst: number };
  bottomNav: { icon: string; label: string; link: string }[];
  pageImages: Record<string, string>;
  howItWorks: HowStep[];
};

export type HowStep = { title: string; desc: string; icon: string; image: string; points: string[] };
export type BannerT = { id: string; title: string; subtitle: string; tagline?: string; image: string; link: string; placement: string };

/* ───────── account ───────── */
export type FamilyMember = { id: string; name: string; relation: string; gotra: string; dob: string };
export type Address = { id: string; label: string; name: string; line: string; city: string; state: string; pin: string; phone: string; default: boolean };
export type Me = {
  id: string;
  phone: string;
  phoneDisplay: string;
  name: string;
  email: string;
  dob: string;
  gotra: string;
  city: string;
  language: "en" | "bn" | "hi";
  family: FamilyMember[];
  addresses: Address[];
  wishlist: string[];
  notifPrefs: { whatsapp: boolean; sms: boolean; email: boolean; push: boolean; offers: boolean };
  createdAt: string;
};

export type HistoryEntry = { status: string; at: string; by?: string; note?: string };

export type Booking = {
  id: string;
  code: string;
  type: "puja" | "chadhava";
  slug: string;
  title: string;
  image: string;
  temple: string;
  date: string;
  pkg: string;
  names: string[];
  gotra: string;
  whatsapp: string;
  wish: string;
  box: boolean;
  amount: number;
  status: string;
  paymentStatus: string;
  history: HistoryEntry[];
  video?: string;
  shipment?: { courier?: string; awb?: string };
  addOns: { key: string; name: string; price: number; qty: number }[];
  createdAt: string;
};

export type Order = {
  id: string;
  code: string;
  date: string;
  items: { slug: string; name: string; image: string; qty: number; price: number; variant?: string }[];
  total: number;
  pricing: { subtotal: number; shipping: number; codFee: number; discount: number; total: number; coupon?: string };
  paymentMethod: "Prepaid" | "COD";
  paymentStatus: string;
  status: string;
  history: HistoryEntry[];
  courier?: string;
  awb?: string;
  canCancel: boolean;
  canReturn: boolean;
};

export type AppNotification = { id: string; title: string; body: string; kind: string; link?: string; unread: boolean; time: string };
export type Ticket = { id: string; subject: string; status: string; updated: string; messages?: { from: string; text: string; at: string }[] };

/** What /checkout/* returns to open the payment step. */
export type CheckoutInfo =
  | { provider: "paytm"; orderId: string; txnToken: string; amount: number; mid: string; scriptUrl: string; refCode: string }
  | { provider: "mock"; orderId: string; amount: number; refCode: string }
  | { provider: "cod" };

export type PaymentResult = { orderId: string; status: "success" | "failed" | "pending" | "refunded"; kind: string; refCode: string; refStatus?: string; title?: string; amount: number; message?: string };
