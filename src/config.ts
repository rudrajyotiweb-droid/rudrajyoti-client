/**
 * App config — switch between local and production here.
 * `isProduction = false` → local backend, `true` → live backend.
 */
export const isProduction = true;

const URLS = {
  local: {
    API_URL: "http://localhost:5000",
  },
  production: {
    API_URL: "https://olive-stingray-140944.hostingersite.com",
  },
};

const current = isProduction ? URLS.production : URLS.local;

/** Base URL of the Rudra Jyoti API (no trailing slash). */
export const API_URL = current.API_URL.replace(/\/+$/, "");
