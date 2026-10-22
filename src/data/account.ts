/** Status steps shown in the user panel (same order the admin moves bookings / orders through). */
export const BOOKING_STEPS = ["Booked", "Sankalp Confirmed", "Puja Scheduled", "Puja Performed", "Video Shared", "Box Dispatched", "Delivered"] as const;
export const CHADHAVA_STEPS = ["Booked", "Sankalp Confirmed", "Puja Performed", "Video Shared"] as const;
export const ORDER_STEPS = ["Placed", "Packed", "Shipped", "Out for delivery", "Delivered"] as const;

/** Index of a status in its step list (−1 for Cancelled / Returned and other off-track states). */
export const stepIndex = (steps: readonly string[], status: string) => {
  const i = steps.indexOf(status);
  if (i >= 0) return i;
  // chadhava has fewer steps — map the puja-only steps onto the nearest one
  if (status === "Puja Scheduled") return steps.indexOf("Sankalp Confirmed");
  if (["Box Dispatched", "Delivered"].includes(status)) return steps.length - 1;
  return -1;
};

/** A video link uploaded in admin is either a file we host (/media/…) or an external link (YouTube, Drive). */
export const isHostedVideo = (url?: string) => !!url && (/^\/media\//.test(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url));
