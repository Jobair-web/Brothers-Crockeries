/** Accepts 01XXXXXXXXX, +8801XXXXXXXXX or 8801XXXXXXXXX. Returns 01XXXXXXXXX or null. */
export function normalizeBdPhone(input: string): string | null {
  const digits = input.replace(/[\s()-]/g, "").replace(/^\+/, "");
  const local = digits.startsWith("880") ? `0${digits.slice(3)}` : digits;
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}

const PHONE_EMAIL_DOMAIN = "phone.brothers-crockeries.local";

/** Better Auth is email-based, so phone accounts use a deterministic internal email. */
export const phoneToEmail = (phone: string) => `${phone}@${PHONE_EMAIL_DOMAIN}`;
export const isPhoneEmail = (email?: string | null) => Boolean(email?.endsWith(`@${PHONE_EMAIL_DOMAIN}`));

/** "Email or phone" field -> email usable by Better Auth, or null when invalid. */
export function identifierToEmail(identifier: string): { email: string; phone?: string } | null {
  const value = identifier.trim();
  if (value.includes("@")) return /^\S+@\S+\.\S+$/.test(value) ? { email: value.toLowerCase() } : null;
  const phone = normalizeBdPhone(value);
  return phone ? { email: phoneToEmail(phone), phone } : null;
}
