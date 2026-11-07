"use client";
import { useState } from "react";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { STORE } from "@/lib/constants";

const toWhatsApp = (n: string) => `88${n.replace(/-/g, "")}`;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hello ${STORE.legalName}, I am ${name}. ${message}`;
    window.open(`https://wa.me/${toWhatsApp(STORE.phones[0].number)}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <p className="mt-1 text-base-content/65">Call or message the shop on WhatsApp. We reply during shop hours.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <ul className="space-y-3">
            {STORE.phones.map((p) => (
              <li key={p.number} className="flex items-center justify-between gap-3 rounded-box border border-base-300/70 bg-base-100 p-4">
                <div><p className="font-semibold">{p.label}</p><p className="text-sm text-base-content/65">{p.number}</p></div>
                <div className="flex gap-2">
                  <a className="btn btn-sm btn-outline" href={`tel:${p.number.replace(/-/g, "")}`}><Phone size={14} /> Call</a>
                  <a className="btn btn-sm btn-success text-success-content" target="_blank" rel="noopener" href={`https://wa.me/${toWhatsApp(p.number)}`}><MessageCircle size={14} /> WhatsApp</a>
                </div>
              </li>
            ))}
          </ul>
          <p className="flex gap-2 rounded-box border border-base-300/70 bg-base-100 p-4 text-sm">
            <MapPin className="mt-0.5 shrink-0 text-primary" size={18} />
            <span>
              {STORE.address}
              <a className="mt-1 block font-medium text-secondary underline" target="_blank" rel="noopener" href={`https://www.google.com/maps/search/${encodeURIComponent(STORE.address)}`}>Open in Google Maps</a>
            </span>
          </p>
        </div>

        <form onSubmit={send} className="space-y-3 rounded-box border border-base-300/70 bg-base-100 p-5">
          <h2 className="font-bold">Send a message on WhatsApp</h2>
          <label className="block text-sm font-medium" htmlFor="c-name">Your name</label>
          <input id="c-name" required className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="block text-sm font-medium" htmlFor="c-msg">Message</label>
          <textarea id="c-msg" required rows={4} className="textarea textarea-bordered w-full" placeholder="Which product do you need?" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className="btn btn-primary w-full">Open WhatsApp</button>
        </form>
      </div>
    </div>
  );
}
