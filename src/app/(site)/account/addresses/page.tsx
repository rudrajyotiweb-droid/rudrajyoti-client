"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Home, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/account/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, inputCls } from "@/components/ui/misc";
import { api, errorMessage } from "@/lib/api";
import type { Address } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast, useAuth } from "@/store";

type Form = { id?: string; label: string; name: string; phone: string; line: string; city: string; state: string; pin: string };

/** Return path after adding an address from the booking / checkout flow. */
const nextPath = () => {
  const n = new URLSearchParams(window.location.search).get("next") ?? "";
  return n.startsWith("/") && !n.startsWith("//") ? n : null;
};

export default function AddressesPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const list = user?.addresses ?? [];
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const empty = (): Form => ({ label: "Home", name: user?.name ?? "", phone: user?.phone ?? "", line: "", city: "", state: "West Bengal", pin: "" });

  // coming from checkout with no address yet → open the form straight away
  useEffect(() => {
    if (nextPath() && list.length === 0) setForm(empty());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (addresses: Address[]) => user && setUser({ ...user, addresses });

  const save = async () => {
    if (!form) return;
    if (form.name.trim().length < 2) return toast("Enter the recipient's name", "error");
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast("Enter a valid 10-digit mobile number", "error");
    if (form.line.trim().length < 5) return toast("Enter the full address", "error");
    if (!/^[1-9]\d{5}$/.test(form.pin)) return toast("Enter a valid 6-digit pincode", "error");
    if (form.city.trim().length < 2 || form.state.trim().length < 2) return toast("Enter city and state", "error");
    setSaving(true);
    try {
      const { id, ...body } = form;
      const res = id ? await api<Address[]>(`/account/addresses/${id}`, { method: "PATCH", body }) : await api<Address[]>("/account/addresses", { body: { ...body, default: list.length === 0 } });
      apply(res);
      setForm(null);
      toast("Address saved");
      const back = nextPath();
      if (back && !id) router.push(back);
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id: string) => {
    try {
      apply(await api<Address[]>(`/account/addresses/${id}`, { method: "PATCH", body: { default: true } }));
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const remove = async (a: Address) => {
    if (!window.confirm(`Delete the ${a.label} address?`)) return;
    try {
      apply(await api<Address[]>(`/account/addresses/${a.id}`, { method: "DELETE" }));
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {list.map((a) => {
            const I = a.label === "Office" ? Briefcase : a.label === "Home" ? Home : MapPin;
            return (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={cn("rounded-3xl border-2 bg-white p-5 transition", a.default ? "border-primary" : "border-border")}>
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                    <I className="h-4 w-4" />
                  </span>
                  <span className="font-semibold">{a.label}</span>
                  {a.default && <span className="rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-semibold text-white">DEFAULT</span>}
                </div>
                <p className="mt-3 text-sm font-medium">{a.name}</p>
                <p className="text-sm text-ink-muted">
                  {a.line}, {a.city}, {a.state} – {a.pin}
                </p>
                <p className="text-sm text-ink-muted">+91 {a.phone}</p>
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-sm">
                  {!a.default && (
                    <button onClick={() => makeDefault(a.id)} className="font-medium text-primary">
                      Set as default
                    </button>
                  )}
                  <button onClick={() => setForm({ id: a.id, label: a.label, name: a.name, phone: a.phone, line: a.line, city: a.city, state: a.state, pin: a.pin })} className="ml-auto grid h-9 w-9 place-items-center rounded-full hover:bg-bg" aria-label="Edit address">
                    <Pencil className="h-4 w-4 text-ink-muted" />
                  </button>
                  <button onClick={() => remove(a)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-primary-soft" aria-label="Delete address">
                    <Trash2 className="h-4 w-4 text-primary" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <button onClick={() => setForm(empty())} className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border text-sm font-medium text-primary hover:border-primary hover:bg-white">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-soft">
            <Plus className="h-5 w-5" />
          </span>
          Add new address
        </button>
      </div>

      <Sheet open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit address" : "Add address"}>
        {form && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {["Home", "Office", "Other"].map((l) => (
                <button key={l} onClick={() => setForm({ ...form, label: l })} className={cn("flex-1 rounded-full border py-2 text-sm", form.label === l ? "border-primary bg-primary text-white" : "border-border bg-white")}>
                  {l}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name">
                <input className={inputCls} value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className={inputCls} inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} />
              </Field>
            </div>
            <Field label="House, street, area">
              <input className={inputCls} value={form.line} maxLength={250} onChange={(e) => setForm({ ...form, line: e.target.value })} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pincode">
                <input className={inputCls} inputMode="numeric" maxLength={6} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} />
              </Field>
              <Field label="City">
                <input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
              <Field label="State">
                <input className={inputCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </Field>
            </div>
            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save address"}
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
