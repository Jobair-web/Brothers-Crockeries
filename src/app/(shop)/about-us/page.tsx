import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Headset, MapPin, Tag, Truck } from "lucide-react";
import { STORE } from "@/lib/constants";

export const metadata: Metadata = { title: "About us" };

const PILLARS = [
  { icon: BadgeCheck, title: "Original products", text: "We stock authentic crockeries and appliances only." },
  { icon: Truck, title: "Fast delivery", text: "We deliver across Bangladesh, with the lowest rates in Chattogram." },
  { icon: Tag, title: "Best price", text: "Buy a single piece at retail or a full order at wholesale rates." },
  { icon: Headset, title: "Customer support", text: "Call or WhatsApp the shop and talk to a real person." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10">
      <p className="text-lg text-secondary">নিউ ব্রাদার্স ক্রোকারিজ</p>
      <h1 className="mt-1 font-brand text-3xl font-extrabold sm:text-4xl">{STORE.legalName}</h1>
      <p className="mt-2 text-lg font-medium text-base-content/70">আপনার ঘরের প্রতিটি প্রয়োজনেই</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4 leading-relaxed text-base-content/85">
          <p>
            {STORE.legalName} is a Chattogram shop for the things a home runs on every day: crockeries, electronics, floor mats, and mops and brushes.
            We sell at both retail and wholesale, and we are also a depot for Smart Mop Factory products.
          </p>
          <p>
            পাইকারী ও খুচরা – দুই ভাবেই কিনতে পারবেন। দোকানে এসে সরাসরি দেখে নিতে পারেন, অথবা এই ওয়েবসাইট থেকে অর্ডার করে বিকাশ/নগদ বা ক্যাশ অন ডেলিভারিতে পেমেন্ট করতে পারেন।
          </p>
          <p className="flex gap-2"><MapPin className="mt-1 shrink-0 text-primary" size={18} />{STORE.address}</p>
          <Link href="/contact-us" className="btn btn-primary btn-sm">Contact the shop</Link>
        </div>

        <ul className="space-y-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3 rounded-box border border-base-300/70 bg-base-100 p-4">
              <Icon className="mt-0.5 shrink-0 text-secondary" size={22} />
              <div><p className="font-semibold">{title}</p><p className="text-sm text-base-content/65">{text}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
