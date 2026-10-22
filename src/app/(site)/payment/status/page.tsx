import { Suspense } from "react";
import { PaymentStatus } from "./PaymentStatus";

export const metadata = { title: "Payment status", robots: { index: false } };

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-16 h-72 max-w-md rounded-3xl skeleton" />}>
      <PaymentStatus />
    </Suspense>
  );
}
