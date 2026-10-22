"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/account/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, inputCls } from "@/components/ui/misc";
import { api, errorMessage } from "@/lib/api";
import type { FamilyMember } from "@/lib/types";
import { initials } from "@/lib/utils";
import { toast, useAuth } from "@/store";

type Draft = Omit<FamilyMember, "id"> & { id?: string };
const blank: Draft = { name: "", relation: "Son", gotra: "", dob: "" };
const tints = ["from-primary to-primary-dark", "from-amber-500 to-orange-600", "from-rose-500 to-pink-700", "from-emerald-600 to-teal-700"];

export default function FamilyPage() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const list = user?.family ?? [];
  const [edit, setEdit] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const apply = (family: FamilyMember[]) => user && setUser({ ...user, family });

  const save = async () => {
    if (!edit || edit.name.trim().length < 2) return toast("Please enter the full name", "error");
    setSaving(true);
    try {
      const body = { name: edit.name.trim(), relation: edit.relation, gotra: edit.gotra.trim(), dob: edit.dob };
      apply(edit.id ? await api<FamilyMember[]>(`/account/family/${edit.id}`, { method: "PATCH", body }) : await api<FamilyMember[]>("/account/family", { body }));
      toast(edit.id ? "Details updated" : "Family member added");
      setEdit(null);
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m: FamilyMember) => {
    if (!window.confirm(`Remove ${m.name}?`)) return;
    try {
      apply(await api<FamilyMember[]>(`/account/family/${m.id}`, { method: "DELETE" }));
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  return (
    <div>
      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-primary-soft/60 px-4 py-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Saved members can be added to any puja sankalp in one tap.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence>
          {list.map((m, i) => (
            <motion.div key={m.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${tints[i % 4]} font-semibold text-white`}>{initials(m.name)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{m.name}</p>
                <p className="text-xs text-ink-muted">
                  {m.relation} · {m.gotra || "Gotra not set"}
                </p>
              </div>
              <button onClick={() => setEdit({ ...m })} aria-label={`Edit ${m.name}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg">
                <Pencil className="h-4 w-4 text-ink-muted" />
              </button>
              <button onClick={() => remove(m)} aria-label={`Remove ${m.name}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-primary-soft">
                <Trash2 className="h-4 w-4 text-primary" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={() => setEdit({ ...blank, relation: list.length ? "Son" : "Self", name: list.length ? "" : (user?.name ?? "") })} className="flex min-h-20 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-primary transition hover:border-primary hover:bg-white">
          <Plus className="h-4 w-4" /> Add family member
        </button>
      </div>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit member" : "Add family member"}>
        {edit && (
          <div className="space-y-4">
            <Field label="Full name">
              <input className={inputCls} value={edit.name} maxLength={80} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Relation">
                <select className={inputCls} value={edit.relation} onChange={(e) => setEdit({ ...edit, relation: e.target.value })}>
                  {["Self", "Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Grandparent", "Other"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date of birth">
                <input type="date" className={inputCls} value={edit.dob} onChange={(e) => setEdit({ ...edit, dob: e.target.value })} />
              </Field>
            </div>
            <Field label="Gotra" hint="Leave blank if unknown — Kashyap will be used.">
              <input className={inputCls} value={edit.gotra} maxLength={60} onChange={(e) => setEdit({ ...edit, gotra: e.target.value })} />
            </Field>
            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
