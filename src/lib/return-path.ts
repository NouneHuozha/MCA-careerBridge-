/** Only allow same-app return destinations; never trust a form redirect blindly. */
export function safeReturnPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://careerbridge.invalid");
    if (url.origin !== "https://careerbridge.invalid" || /^\/(?:api|sign-in|sign-up)(?:\/|$)/.test(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}
