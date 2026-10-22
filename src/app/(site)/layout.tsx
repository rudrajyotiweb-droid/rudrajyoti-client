import { InstallPrompt, OfflineToast, ServiceWorkerRegister, Toast, WhatsAppFab } from "@/components/layout/AppChrome";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSettings } from "@/lib/settings";
import { SiteProvider } from "@/lib/site";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Admin → Settings (contact, shipping, bottom nav); static defaults if the API is down
  const settings = await getSettings();
  return (
    <SiteProvider value={settings}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer brand={settings.brand} />
      <BottomNav />
      <WhatsAppFab />
      <InstallPrompt />
      <OfflineToast />
      <Toast />
      <ServiceWorkerRegister />
    </SiteProvider>
  );
}
