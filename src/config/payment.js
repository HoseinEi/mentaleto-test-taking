const env = import.meta.env.VITE_ZARINPAL_ENV || "production";

export const isZarinpalSandbox = env === "sandbox";