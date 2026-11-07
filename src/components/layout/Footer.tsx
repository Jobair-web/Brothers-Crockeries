import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { STORE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-16 bg-neutral text-neutral-content">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-12 w-auto" />
            <div className="font-brand leading-tight">
              <p className="text-sm font-extrabold tracking-[0.18em] text-primary">BROTHERS</p>
              <p className="text-xs font-semibold tracking-[0.3em]">CROCKERIES</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-content/75">
            {STORE.legalName} sells crockeries, electronics, mats and mop brushes at retail and wholesale. {STORE.tagline}.
          </p>
        </div>

        <nav aria-label="Shop links">
          <h3 className="font-semibold text-white">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-content/75">
            {[
              ["All products", "/products"],
              ["Wishlist", "/wishlist"],
              ["Cart", "/cart"],
              ["My orders", "/orders"],
              ["Care tips", "/tips/ceramic-care"],
              ["About us", "/about-us"],
              ["Contact us", "/contact-us"],
            ].map(([label, href]) => (
              <li key={href}><Link href={href} className="transition-colors hover:text-primary">{label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="font-semibold text-white">Visit or call us</h3>
          <p className="mt-3 flex gap-2 text-sm text-neutral-content/75"><MapPin size={16} className="mt-0.5 shrink-0 text-primary" />{STORE.address}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-neutral-content/75">
            {STORE.phones.map((p) => (
              <li key={p.number} className="flex items-center gap-2">
                <Phone size={14} className="text-primary" />
                <a href={`tel:${p.number.replace(/-/g, "")}`} className="hover:text-primary">{p.number}</a>
                <span className="text-neutral-content/50">({p.label})</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-content/60">We accept bKash / Nagad and Cash on Delivery.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-neutral-content/55">
        © {new Date().getFullYear()} {STORE.legalName}. All rights reserved.
      </div>
    </footer>
  );
}
