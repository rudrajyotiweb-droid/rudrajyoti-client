"use client";

/**
 * Opens the payment step for a checkout.
 * PayU Hosted Checkout: the API returns signed form fields, the browser POSTs them to PayU,
 * and PayU posts the result back to the API, which verifies it with PayU's verify_payment API
 * and redirects to /payment/status. The final status always comes from our API.
 */
import { api } from "./api";
import type { CheckoutInfo, PaymentResult } from "./types";

export const verifyPayment = (orderId: string) => api<PaymentResult>("/payments/verify", { body: { orderId } });

/** Submits the signed form to PayU. The page navigates away, so the promise never resolves. */
function payu(info: Extract<CheckoutInfo, { provider: "payu" }>): Promise<PaymentResult> {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = info.action;
  form.style.display = "none";
  for (const [name, value] of Object.entries(info.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  return new Promise<PaymentResult>(() => {});
}

/** Development stand-in (PAYMENT_PROVIDER=mock on the API). */
async function mock(info: Extract<CheckoutInfo, { provider: "mock" }>): Promise<PaymentResult> {
  const ok = window.confirm(`TEST MODE — no real money\n\nPay ₹${info.amount} for ${info.refCode}?\n\nOK = payment succeeds, Cancel = payment fails`);
  return api<PaymentResult>("/payments/mock/complete", { body: { orderId: info.orderId, success: ok } });
}

export async function runPayment(info: CheckoutInfo): Promise<PaymentResult | null> {
  if (info.provider === "cod") return null;
  if (info.provider === "mock") return mock(info);
  return payu(info);
}
