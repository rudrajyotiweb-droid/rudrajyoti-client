"use client";

import { ChevronRight, Mail, MessageCircle, Phone, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/account/Sheet";
import { Button } from "@/components/ui/Button";
import { Accordion, Field, inputCls } from "@/components/ui/misc";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { useSite } from "@/lib/site";
import type { Ticket } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "@/store";

export default function SupportPage() {
  const [open, setOpen] = useState(false);
  const site = useSite().brand;
  const tickets = useApi<Ticket[]>("/account/tickets");
  const faqs = useApi<{ id: string; q: string; a: string }[]>("/faqs").data ?? [];
  const [form, setForm] = useState({ topic: "Puja booking", subject: "", message: "", refCode: "" });
  const [busy, setBusy] = useState(false);
  const [openTicket, setOpenTicket] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  // "Help" from a booking pre-fills the reference
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      setForm((f) => ({ ...f, refCode: ref, subject: `Help with ${ref}` }));
      setOpen(true);
    }
  }, []);

  const submit = async () => {
    if (form.subject.trim().length < 4) return toast("Please add a short subject", "error");
    if (form.message.trim().length < 5) return toast("Please describe your issue", "error");
    setBusy(true);
    try {
      await api("/account/tickets", { body: { subject: `[${form.topic}] ${form.subject.trim()}`, message: form.message.trim(), ...(form.refCode ? { refCode: form.refCode } : {}) } });
      setOpen(false);
      setForm({ topic: "Puja booking", subject: "", message: "", refCode: "" });
      toast("Ticket raised — we'll reply soon");
      tickets.reload();
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async (code: string) => {
    if (!reply.trim()) return;
    try {
      await api(`/account/tickets/${code}/reply`, { body: { message: reply.trim() } });
      setReply("");
      tickets.reload();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [MessageCircle, "WhatsApp", "Chat with us", `https://wa.me/${site.whatsapp}`, "bg-[#25D366]/15 text-[#128C7E]"],
          [Phone, "Call", site.phone, `tel:${site.phone}`, "bg-primary-soft text-primary"],
          [Mail, "Email", "Reply in 24 hrs", `mailto:${site.email}`, "bg-amber-100 text-amber-700"],
        ].map(([I, t, d, href, tone]) => {
          const C = I as typeof Mail;
          return (
            <a key={t as string} href={href as string} className="group flex items-center gap-3 rounded-2xl border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
              <span className={cn("grid h-11 w-11 place-items-center rounded-xl", tone as string)}>
                <C className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <b className="block text-sm">{t as string}</b>
                <span className="text-xs text-ink-muted">{d as string}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-ink-muted" />
            </a>
          );
        })}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-serif text-xl font-semibold">My tickets</p>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New ticket
          </Button>
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
          {tickets.data?.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink-muted">No tickets yet. We are here to help 🙏</li>}
          {(tickets.data ?? []).map((t) => (
            <li key={t.id}>
              <button onClick={() => setOpenTicket(openTicket === t.id ? null : t.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                <span className="font-mono text-xs text-ink-muted">{t.id}</span>
                <span className="flex-1 text-sm">{t.subject}</span>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", t.status === "Resolved" ? "bg-success/10 text-success" : "bg-amber-100 text-amber-700")}>{t.status === "Pending" ? "Replied" : t.status}</span>
              </button>
              {openTicket === t.id && (
                <div className="space-y-2 border-t border-border bg-bg/60 px-4 py-3">
                  {(t.messages ?? []).map((m, i) => (
                    <p key={i} className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", m.from === "customer" ? "ml-auto bg-primary text-white" : "bg-white")}>
                      {m.text}
                    </p>
                  ))}
                  {t.status !== "Resolved" && (
                    <div className="flex gap-2 pt-1">
                      <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply(t.id)} placeholder="Write a reply…" className={cn(inputCls, "h-10 text-sm")} />
                      <Button size="sm" onClick={() => sendReply(t.id)}>
                        Send
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="mb-3 font-serif text-xl font-semibold">Common questions</p>
        <Accordion items={faqs} defaultOpen={-1} />
      </section>

      <Sheet open={open} onClose={() => setOpen(false)} title="Raise a ticket">
        <div className="space-y-4">
          <Field label="Related to">
            <select className={inputCls} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
              <option>Puja booking</option>
              <option>Store order</option>
              <option>Payment / refund</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Subject">
            <input className={inputCls} maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Briefly describe the issue" />
          </Field>
          <Field label="Details">
            <textarea className={cn(inputCls, "h-auto py-3")} rows={4} maxLength={4000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </Field>
          <Button className="w-full" onClick={submit} disabled={busy}>
            {busy ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
