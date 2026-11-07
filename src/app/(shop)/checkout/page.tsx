"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { BKASH_NUMBER, DISTRICTS, SHIPPING_ZONES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { isPhoneEmail, normalizeBdPhone } from "@/lib/phone";
import { cartSubtotal, useCartStore } from "@/store/useCartStore";
import { useHydrated } from "@/hooks/useHydrated";
import type { PaymentMethod, ShippingZone } from "@/types";

const zoneForDistrict = (d: string): ShippingZone => (d === "Dhaka" ? "dhaka" : d === "Chattogram" ? "chattogram" : "others");

const emptyForm = {
  firstName: "", lastName: "", company: "", country: "Bangladesh", address: "", apartment: "",
  city: "", district: "Chattogram", postcode: "", phone: "", email: "", notes: "",
};

const emptyShip = { firstName: "", lastName: "", address: "", apartment: "", city: "", district: "Chattogram", postcode: "", phone: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { data: session } = useSession();
  const { items, clear } = useCartStore();
  const subtotal = cartSubtotal(items);

  const [form, setForm] = useState(emptyForm);
  const [shipDifferent, setShipDifferent] = useState(false);
  const [ship, setShip] = useState(emptyShip);
  const setS = (k: keyof typeof emptyShip) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setShip((v) => ({ ...v, [k]: e.target.value }));
  const [zone, setZone] = useState<ShippingZone>("chattogram");
  const [method, setMethod] = useState<PaymentMethod>("bkash_nagad");
  const [sender, setSender] = useState("");
  const [trxId, setTrxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-fill from the signed-in account once
  useEffect(() => {
    const u = session?.user;
    if (!u) return;
    const [first = "", ...rest] = (u.name ?? "").split(" ");
    setForm((f) => ({
      ...f,
      firstName: f.firstName || first,
      lastName: f.lastName || rest.join(" "),
      email: f.email || (isPhoneEmail(u.email) ? "" : u.email),
      phone: f.phone || (u.phone ?? ""),
    }));
  }, [session?.user]);

  const shipping = SHIPPING_ZONES[zone].cost;
  const total = subtotal + shipping;
  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(BKASH_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.info(`Number: ${BKASH_NUMBER}`);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = normalizeBdPhone(form.phone);
    if (!phone) return toast.error("Enter a valid Bangladeshi mobile number (01XXXXXXXXX)");
    let shipping;
    if (shipDifferent) {
      const shipPhone = ship.phone.trim() ? normalizeBdPhone(ship.phone) : phone;
      if (!shipPhone) return toast.error("Enter a valid mobile number for the delivery address");
      shipping = { ...ship, phone: shipPhone };
    }
    if (method === "bkash_nagad" && (!normalizeBdPhone(sender) || !trxId.trim())) {
      return toast.error("Enter the number you paid from and the transaction ID");
    }

    setSubmitting(true);
    try {
      const { order } = await api.orders.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        billing: { ...form, phone, email: form.email.trim() },
        shipping,
        notes: form.notes,
        shippingZone: zone,
        paymentMethod: method,
        payment: method === "bkash_nagad" ? { senderNumber: normalizeBdPhone(sender) ?? sender, transactionId: trxId.trim() } : undefined,
      });
      clear();
      toast.success("Order placed successfully");
      router.push(`/order-success?order=${order.orderNumber}&method=${method}`);
    } catch (err) {
      const msg = err instanceof ApiError ? (err.details?.[0]?.message ?? err.message) : "Could not place the order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) return <div className="mx-auto max-w-[1100px] px-4 py-10"><div className="h-60 animate-pulse rounded-box bg-base-300/60" /></div>;
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Link href="/products" className="btn btn-primary btn-sm mt-4">Browse products</Link>
      </div>
    );
  }

  const field = "input input-bordered w-full";
  const label = "mb-1 block text-sm font-medium";

  return (
    <form onSubmit={submit} className="mx-auto max-w-[1200px] px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      {!session?.user && (
        <p className="mt-3 rounded-box bg-info/10 px-4 py-3 text-sm">
          Have an account? <Link href="/login?redirect=/checkout" className="font-semibold text-secondary underline">Sign in</Link> to save your order history. You can also check out as a guest.
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_440px]">
        {/* Billing */}
        <section aria-labelledby="billing-title">
          <h2 id="billing-title" className="text-xl font-bold">Billing details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className={label} htmlFor="firstName">First name *</label><input id="firstName" required className={field} value={form.firstName} onChange={set("firstName")} autoComplete="given-name" /></div>
            <div><label className={label} htmlFor="lastName">Last name *</label><input id="lastName" required className={field} value={form.lastName} onChange={set("lastName")} autoComplete="family-name" /></div>
            <div className="sm:col-span-2"><label className={label} htmlFor="company">Company name (optional)</label><input id="company" className={field} value={form.company} onChange={set("company")} /></div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="country">Country / Region *</label>
              <select id="country" className="select select-bordered w-full" value={form.country} onChange={set("country")}><option>Bangladesh</option></select>
            </div>
            <div className="sm:col-span-2"><label className={label} htmlFor="address">Street address *</label><input id="address" required className={field} placeholder="House number and street name" value={form.address} onChange={set("address")} autoComplete="address-line1" /></div>
            <div className="sm:col-span-2"><input aria-label="Apartment, suite, unit (optional)" className={field} placeholder="Apartment, suite, unit, etc. (optional)" value={form.apartment} onChange={set("apartment")} autoComplete="address-line2" /></div>
            <div><label className={label} htmlFor="city">Town / City *</label><input id="city" required className={field} value={form.city} onChange={set("city")} autoComplete="address-level2" /></div>
            <div>
              <label className={label} htmlFor="district">District *</label>
              <select id="district" className="select select-bordered w-full" value={form.district} onChange={(e) => { set("district")(e); if (!shipDifferent) setZone(zoneForDistrict(e.target.value)); }}>
                {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className={label} htmlFor="postcode">Postcode / ZIP (optional)</label><input id="postcode" className={field} value={form.postcode} onChange={set("postcode")} autoComplete="postal-code" /></div>
            <div><label className={label} htmlFor="phone">Phone *</label><input id="phone" required type="tel" inputMode="tel" className={field} placeholder="01XXXXXXXXX" value={form.phone} onChange={set("phone")} autoComplete="tel" /></div>
            <div className="sm:col-span-2"><label className={label} htmlFor="email">Email address (optional)</label><input id="email" type="email" className={field} value={form.email} onChange={set("email")} autoComplete="email" /></div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 text-lg font-bold">
                <input
                  type="checkbox" className="checkbox checkbox-primary" checked={shipDifferent}
                  onChange={(e) => { setShipDifferent(e.target.checked); setZone(zoneForDistrict(e.target.checked ? ship.district : form.district)); }}
                />
                Ship to a different address?
              </label>
            </div>
            {shipDifferent && (
              <>
                <div><label className={label} htmlFor="s-first">First name *</label><input id="s-first" required className={field} value={ship.firstName} onChange={setS("firstName")} /></div>
                <div><label className={label} htmlFor="s-last">Last name *</label><input id="s-last" required className={field} value={ship.lastName} onChange={setS("lastName")} /></div>
                <div className="sm:col-span-2"><label className={label} htmlFor="s-address">Street address *</label><input id="s-address" required className={field} placeholder="House number and street name" value={ship.address} onChange={setS("address")} /></div>
                <div className="sm:col-span-2"><input aria-label="Apartment, suite, unit (optional)" className={field} placeholder="Apartment, suite, unit, etc. (optional)" value={ship.apartment} onChange={setS("apartment")} /></div>
                <div><label className={label} htmlFor="s-city">Town / City *</label><input id="s-city" required className={field} value={ship.city} onChange={setS("city")} /></div>
                <div>
                  <label className={label} htmlFor="s-district">District *</label>
                  <select id="s-district" className="select select-bordered w-full" value={ship.district} onChange={(e) => { setS("district")(e); setZone(zoneForDistrict(e.target.value)); }}>
                    {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div><label className={label} htmlFor="s-post">Postcode / ZIP (optional)</label><input id="s-post" className={field} value={ship.postcode} onChange={setS("postcode")} /></div>
                <div><label className={label} htmlFor="s-phone">Phone (optional)</label><input id="s-phone" type="tel" className={field} placeholder="Defaults to your billing phone" value={ship.phone} onChange={setS("phone")} /></div>
              </>
            )}
            <div className="sm:col-span-2"><label className={label} htmlFor="notes">Order notes (optional)</label><textarea id="notes" rows={3} className="textarea textarea-bordered w-full" placeholder="Notes about your order, e.g. special notes for delivery." value={form.notes} onChange={set("notes")} /></div>
          </div>
        </section>

        {/* Order summary */}
        <aside aria-labelledby="order-title" className="h-fit rounded-box border-2 border-base-300 bg-base-100 p-5 lg:sticky lg:top-24">
          <h2 id="order-title" className="text-xl font-bold">Your order</h2>
          <ul className="mt-4 divide-y divide-base-200 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-4 py-2.5">
                <span>{i.title} <strong className="whitespace-nowrap">× {i.quantity}</strong></span>
                <span className="whitespace-nowrap">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="flex justify-between border-t border-base-300 py-3 font-semibold"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></p>

          <fieldset className="border-t border-base-300 py-3">
            <legend className="sr-only">Shipment</legend>
            <p className="mb-2 font-semibold">Shipment</p>
            {(Object.keys(SHIPPING_ZONES) as ShippingZone[]).map((z) => (
              <label key={z} className="flex cursor-pointer items-center gap-3 py-1 text-sm">
                <input type="radio" name="zone" className="radio radio-sm radio-primary" checked={zone === z} onChange={() => setZone(z)} />
                <span className="flex-1 font-medium">{SHIPPING_ZONES[z].label}</span>
                <span className="font-semibold">{formatPrice(SHIPPING_ZONES[z].cost)}</span>
              </label>
            ))}
          </fieldset>

          <p className="flex justify-between border-t border-base-300 py-3 text-lg font-bold"><span>Total</span><span className="text-accent">{formatPrice(total)}</span></p>

          <fieldset className="border-t border-base-300 pt-3">
            <legend className="sr-only">Payment method</legend>
            <label className="flex cursor-pointer items-center gap-3 py-1.5">
              <input type="radio" name="pay" className="radio radio-primary radio-sm" checked={method === "bkash_nagad"} onChange={() => setMethod("bkash_nagad")} />
              <span className="font-medium">bKash / Nagad</span>
            </label>
            {method === "bkash_nagad" && (
              <div className="mb-2 mt-1 space-y-3 rounded-box bg-primary/10 p-4 text-sm">
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Open bKash or Nagad and choose <strong>Send Money</strong>.</li>
                  <li>Send <strong>{formatPrice(total)}</strong> to this number:</li>
                </ol>
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span className="text-lg font-bold tracking-wide">{BKASH_NUMBER} <span className="text-xs font-normal text-base-content/60">(Personal)</span></span>
                  <button type="button" onClick={copyNumber} className="btn btn-ghost btn-xs gap-1" aria-label="Copy number">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button>
                </div>
                <p>Then enter the details below so we can verify your payment.</p>
                <input className="input input-bordered input-sm w-full" placeholder="Number you paid from (01XXXXXXXXX)" value={sender} onChange={(e) => setSender(e.target.value)} inputMode="tel" aria-label="Number you paid from" />
                <input className="input input-bordered input-sm w-full" placeholder="Transaction ID (TrxID)" value={trxId} onChange={(e) => setTrxId(e.target.value)} aria-label="Transaction ID" />
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-3 py-1.5">
              <input type="radio" name="pay" className="radio radio-primary radio-sm" checked={method === "cod"} onChange={() => setMethod("cod")} />
              <span className="font-medium">Cash on delivery</span>
            </label>
            {method === "cod" && <p className="mb-2 rounded-box bg-base-200 p-3 text-sm">Pay in cash when your order arrives.</p>}
          </fieldset>

          <p className="mt-3 text-xs text-base-content/60">Your personal data is used only to process your order and support your experience on this site.</p>
          <button type="submit" disabled={submitting} className="btn btn-accent mt-4 w-full">
            {submitting ? <><Loader2 size={18} className="animate-spin" /> Placing order…</> : "Place order"}
          </button>
        </aside>
      </div>
    </form>
  );
}
