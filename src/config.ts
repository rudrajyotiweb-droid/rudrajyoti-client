/**
 * App config — switch between local and production here.
 * `isProduction = false` → local backend, `true` → live backend.
 */
export const isProduction = false;

const URLS = {
  local: {
    API_URL: "http://localhost:5000",
  },
  production: {
    API_URL: "https://api.rudrajyoti.in",
  },
};

const current = isProduction ? URLS.production : URLS.local;

/** Base URL of the Rudra Jyoti API (no trailing slash). */
export const API_URL = current.API_URL.replace(/\/+$/, "");
