"use client";

import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputCls } from "@/components/ui/misc";
import { FontSizeControl } from "@/components/layout/FontSizeControl";
import { api, errorMessage } from "@/lib/api";
import type { Me } from "@/lib/types";
import { cn, initials } from "@/lib/utils";
import { toast, useAuth } from "@/store";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const logout = useAuth((s) => s.logout);
  const [f, setF] = useState({ name: "", email: "", dob: "", gotra: "", city: "", lang: "en" as "en" | "bn" | "hi" });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (user) setF({ name: user.name, email: user.email, dob: user.dob, gotra: user.gotra, city: user.city, lang: user.language });
  }, [user]);

  const save = async (patch?: Partial<{ language: "en" | "bn" | "hi" }>) => {
    if (!patch && f.name.trim().length < 2) return toast("Please enter your full name", "error");
    setSaving(true);
    try {
      const body = patch ?? { name: f.name.trim(), email: f.email.trim(), dob: f.dob, gotra: f.gotra.trim(), city: f.city.trim() };
      setUser(await api<Me>("/account/profile", { method: "PATCH", body }));
      if (!patch) toast("Profile updated");
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account permanently? Your saved family, addresses and wishlist will be removed. Past bookings stay with us for legal records.")) return;
    try {
      await api("/account/", { method: "DELETE" });
      await logout();
      toast("Your account has been deleted", "info");
      router.replace("/");
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-border bg-white p-5 md:p-7">
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark font-serif text-2xl text-white">{initials(f.name || "D")}</span>
          </div>
          <div>
            <p className="font-serif text-xl font-semibold">{f.name || "Devotee"}</p>
            <p className="text-sm text-ink-muted">{user?.phoneDisplay} · verified</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Mobile number" hint="Used for login via OTP">
            <input className={cn(inputCls, "bg-bg text-ink-muted")} value={user?.phoneDisplay ?? ""} disabled />
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </Field>
          <Field label="Date of birth">
            <input className={inputCls} type="date" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} />
          </Field>
          <Field label="Gotra" hint="Pre-filled in every sankalp">
            <input className={inputCls} value={f.gotra} maxLength={60} onChange={(e) => setF({ ...f, gotra: e.target.value })} />
          </Field>
          <Field label="City">
            <input className={inputCls} value={f.city} maxLength={60} onChange={(e) => setF({ ...f, city: e.target.value })} />
          </Field>
        </div>
        <Button className="mt-6" onClick={() => save()} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </section>

      <section className="rounded-3xl border border-border bg-white p-5 md:p-7">
        <p className="font-serif text-xl font-semibold">Preferences</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span>
              <b className="block text-sm">Language</b>
              <span className="text-xs text-ink-muted">Used across the site and notifications</span>
            </span>
            <div className="flex gap-1 rounded-full border border-border p-1">
              {[
                ["en", "English"],
                ["bn", "বাংলা"],
              ].map(([id, l]) => (
                <button key={id} onClick={() => {
                  setF({ ...f, lang: id as "en" | "bn" });
                  void save({ language: id as "en" | "bn" });
                }} className={cn("rounded-full px-4 py-1.5 text-sm", f.lang === id ? "bg-primary text-white" : "")}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>
              <b className="block text-sm">Text size</b>
              <span className="text-xs text-ink-muted">Make reading easier</span>
            </span>
            <FontSizeControl dark />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/30 bg-primary-soft/40 p-5 md:p-7">
        <p className="flex items-center gap-2 font-semibold text-primary">
          <ShieldAlert className="h-5 w-5" /> Your data &amp; privacy
        </p>
        <p className="mt-1 text-sm text-ink-muted">You can permanently delete your account at any time (DPDP Act 2023).</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" className="text-primary" onClick={deleteAccount}>
            Delete account
          </Button>
        </div>
      </section>
    </div>
  );
}
