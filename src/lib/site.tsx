"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS } from "./settings";
import type { SiteSettings } from "./types";

const Ctx = createContext<SiteSettings>(DEFAULT_SETTINGS);

/** Settings from Admin → Settings, fetched once per ISR window in the site layout. */
export function SiteProvider({ value, children }: { value: SiteSettings; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);
