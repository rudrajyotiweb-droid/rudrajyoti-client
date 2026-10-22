"use client";

/**
 * Opens the payment step for a checkout and resolves with the server-verified result.
 * Paytm JS Checkout runs in an overlay (merchant.redirect = false); whatever the overlay says,
 * the final status always comes from our API, which asks Paytm's order-status API.
 */
import { api, ApiError } from "./api";
import type { CheckoutInfo, PaymentResult } from "./types";

type PaytmConfig = {
  root: string;
  flow: "DEFAULT";
  merchant: { redirect: boolean; name?: string };
  data: { orderId: string; token: string; tokenType: "TXN_TOKEN"; amount: string };
  handler: { notifyMerchant: (eventName: string, data: unknown) => void; transactionStatus: (data: unknown) => void };
};

declare global {
  interface Window {
    Paytm?: { CheckoutJS: { init: (c: PaytmConfig) => Promise<void>; invoke: () => void; close: () => void; onLoad: (cb: () => void) => void } };
  }
}

const scripts = new Map<string, Promise<void>>();
function loadScript(src: string) {
  if (!scripts.has(src)) {
    scripts.set(
      src,
      new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.crossOrigin = "anonymous";
        s.onload = () => resolve();
        s.onerror = () => {
          scripts.delete(src);
          s.remove();
          reject(new ApiError(0, "Could not load the payment page. Check your internet connection and try again.", "PAYTM_SCRIPT"));
        };
        document.body.appendChild(s);
      }),
    );
  }
  return scripts.get(src)!;
}

export const verifyPayment = (orderId: string) => api<PaymentResult>("/payments/verify", { body: { orderId } });

async function paytm(info: Extract<CheckoutInfo, { provider: "paytm" }>, merchantName: string): Promise<PaymentResult> {
  await loadScript(info.scriptUrl);
  const P = window.Paytm?.CheckoutJS;
  if (!P) throw new ApiError(0, "Payment page failed to start. Please try again.", "PAYTM_SCRIPT");

  return new Promise<PaymentResult>((resolve, reject) => {
    let settled = false;
    const finish = async () => {
      if (settled) return;
      settled = true;
      try {
        P.close();
      } catch {
        /* overlay may already be closed */
      }
      try {
        resolve(await verifyPayment(info.orderId));
      } catch (e) {
        reject(e);
      }
    };

    const config: PaytmConfig = {
      root: "",
      flow: "DEFAULT",
      merchant: { redirect: false, name: merchantName },
      data: { orderId: info.orderId, token: info.txnToken, tokenType: "TXN_TOKEN", amount: info.amount.toFixed(2) },
      handler: {
        transactionStatus: () => void finish(),
        // the user closed the overlay without paying (or the session expired)
        notifyMerchant: (eventName) => {
          if (eventName === "APP_CLOSED" || eventName === "SESSION_EXPIRED") void finish();
        },
      },
    };
    const start = () =>
      P.init(config)
        .then(() => P.invoke())
        .catch(() => {
          settled = true;
          reject(new ApiError(0, "Payment page failed to open. Please try again.", "PAYTM_INIT"));
        });
    if (typeof P.onLoad === "function") P.onLoad(start);
    else start();
  });
}

/** Development stand-in (PAYMENT_PROVIDER=mock on the API). */
async function mock(info: Extract<CheckoutInfo, { provider: "mock" }>): Promise<PaymentResult> {
  const ok = window.confirm(`TEST MODE — no real money\n\nPay ₹${info.amount} for ${info.refCode}?\n\nOK = payment succeeds, Cancel = payment fails`);
  return api<PaymentResult>("/payments/mock/complete", { body: { orderId: info.orderId, success: ok } });
}

export async function runPayment(info: CheckoutInfo, merchantName = "Rudra Jyoti"): Promise<PaymentResult | null> {
  if (info.provider === "cod") return null;
  if (info.provider === "mock") return mock(info);
  return paytm(info, merchantName);
}
