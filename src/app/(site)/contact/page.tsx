"use client";

import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, inputCls } from "@/components/ui/misc";
import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";
import { toast } from "@/store";

export default function ContactPage() {
  const { brand: site, pageImages } = useSite();
  const [busy, setBusy] = useState(false);
  return (
    <>
      <PageHeader title="Contact us" subtitle={`Our seva team is here to help — ${site.supportHours}.`} image={pageImages.contact} crumbs={[["Home", "/"], ["Contact"]]} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-12 md:grid-cols-[1fr_1.3fr] md:px-6">
        <div className="space-y-3">
          {[
            [MessageCircle, "WhatsApp", "Chat with our seva team", `https://wa.me/${site.whatsapp}`],
            [Phone, "Phone", site.phone, `tel:${site.phone}`],
            [Mail, "Email", site.email, `mailto:${site.email}`],
            [MapPin, "Office", site.address, `https://maps.google.com/?q=${encodeURIComponent(site.address)}`],
            [Clock, "Hours", site.supportHours, "#"],
          ].map(([I, t, d, h]) => {
            const C = I as typeof Mail;
            return (
              <a key={t as string} href={h as string} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 transition hover:border-primary">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <C className="h-5 w-5" />
                </span>
                <span>
                  <b className="block text-sm">{t as string}</b>
                  <span className="text-sm text-ink-muted">{d as string}</span>
                </span>
              </a>
            );
          })}
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
            setBusy(true);
            try {
              const r = await api<{ ticket: string }>("/contact", { body: { name: data.name, phone: data.phone, email: data.email ?? "", message: data.message }, auth: false });
              toast(`Message received (${r.ticket}) — we'll get back soon 🙏`);
              form.reset();
            } catch (err) {
              toast(errorMessage(err), "error");
            } finally {
              setBusy(false);
            }
          }}
          className="rounded-3xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] md:p-8"
        >
          <p className="font-serif text-2xl font-semibold">Send us a message</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input name="name" required minLength={2} maxLength={80} className={inputCls} />
            </Field>
            <Field label="Phone">
              <input name="phone" required inputMode="tel" maxLength={14} placeholder="10-digit mobile" className={inputCls} />
            </Field>
          </div>
          <Field label="Email" className="mt-4">
            <input name="email" type="email" className={inputCls} />
          </Field>
          <Field label="Message" className="mt-4">
            <textarea name="message" required minLength={10} maxLength={3000} rows={5} className={cn(inputCls, "h-auto py-3")} />
          </Field>
          <Button type="submit" className="mt-5" disabled={busy}>
            <Send className="h-4 w-4" /> {busy ? "Sending…" : "Send message"}
          </Button>
        </form>
      </div>
    </>
  );
}
