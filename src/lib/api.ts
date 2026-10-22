/**
 * API client used by server components (ISR fetch) and the browser.
 * Every call returns parsed `data` or throws an ApiError with a user-friendly message.
 */

import { API_URL } from "@/config";

/** Base URL comes from src/config.ts (toggle `isProduction` there). */
const PUBLIC_API = API_URL;
const SERVER_API = API_URL;

export const API_ORIGIN = PUBLIC_API;

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, message: string, code = "ERROR", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Json = Record<string, unknown> | unknown[];

async function parse<T>(res: Response): Promise<{ data: T; meta?: Record<string, unknown> }> {
  let body: { data?: T; meta?: Record<string, unknown>; error?: { code?: string; message?: string; details?: unknown } } | null = null;
  try {
    body = res.status === 204 ? {} : await res.json();
  } catch {
    body = null;
  }
  if (!res.ok || !body) {
    const err = body?.error;
    throw new ApiError(res.status, err?.message ?? (res.status >= 500 ? "Server is busy. Please try again in a moment." : "Something went wrong. Please try again."), err?.code, err?.details);
  }
  return { data: body.data as T, meta: body.meta };
}

/* ───────── Server components (ISR) ───────── */

/**
 * Fetch for server components. `revalidate` seconds of ISR caching (default 60).
 * Returns null for 404 so pages can call notFound(); throws on other failures.
 */
export async function serverGet<T>(path: string, { revalidate = 60 }: { revalidate?: number } = {}): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${SERVER_API}/api/v1${path}`, { next: { revalidate }, headers: { accept: "application/json" } });
  } catch {
    throw new ApiError(503, "Our servers are unreachable right now. Please try again shortly.", "NETWORK");
  }
  if (res.status === 404) return null;
  return (await parse<T>(res)).data;
}

/** Like serverGet but never throws — for optional data (falls back to `fallback`). */
export async function serverTry<T>(path: string, fallback: T, opts?: { revalidate?: number }): Promise<T> {
  try {
    return (await serverGet<T>(path, opts)) ?? fallback;
  } catch {
    return fallback;
  }
}

/* ───────── Browser ───────── */

type Opts = { method?: string; body?: Json; auth?: boolean; signal?: AbortSignal };

let tokenGetter: (() => string | null) | null = null;
let refresher: (() => Promise<string | null>) | null = null;
let onAuthLost: (() => void) | null = null;

/** Wired by the auth store so this module stays framework-free. */
export function configureAuth(cfg: { getToken: () => string | null; refresh: () => Promise<string | null>; onLost: () => void }) {
  tokenGetter = cfg.getToken;
  refresher = cfg.refresh;
  onAuthLost = cfg.onLost;
}

async function raw(path: string, opts: Opts, token: string | null) {
  const headers: Record<string, string> = { accept: "application/json" };
  if (opts.body !== undefined) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  try {
    return await fetch(`${PUBLIC_API}/api/v1${path}`, { method: opts.method ?? (opts.body ? "POST" : "GET"), headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined, signal: opts.signal });
  } catch (e) {
    if ((e as Error)?.name === "AbortError") throw e;
    throw new ApiError(0, "No internet connection or our server is unreachable. Please try again.", "NETWORK");
  }
}

/** Browser API call. With auth (default for /account, /checkout, /payments) the access token is refreshed once on 401. */
export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  return (await apiWithMeta<T>(path, opts)).data;
}

export async function apiWithMeta<T>(path: string, opts: Opts = {}): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const auth = opts.auth ?? /^\/(account|checkout|payments|auth\/me)/.test(path);
  let token = auth ? (tokenGetter?.() ?? null) : null;
  let res = await raw(path, opts, token);
  if (auth && res.status === 401 && refresher) {
    token = await refresher();
    if (token) res = await raw(path, opts, token);
    else onAuthLost?.();
  }
  return parse<T>(res);
}

/** Anonymous analytics ping; never throws. */
export function track(type: "puja_view" | "package_selected" | "sankalp_filled" | "visit", source?: string) {
  try {
    void fetch(`${PUBLIC_API}/api/v1/events`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type, source }), keepalive: true }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export const errorMessage = (e: unknown, fallback = "Something went wrong. Please try again.") => (e instanceof ApiError ? e.message : e instanceof Error && e.name !== "AbortError" ? fallback : fallback);
