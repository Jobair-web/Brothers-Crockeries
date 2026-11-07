import { BadgeCheck, Headset, Tag, Truck } from "lucide-react";

const ITEMS = [
  { icon: BadgeCheck, title: "Original products", text: "Authentic brands only" },
  { icon: Truck, title: "Fast delivery", text: "Dhaka, Chattogram and nationwide" },
  { icon: Tag, title: "Best price", text: "Retail and wholesale rates" },
  { icon: Headset, title: "Customer support", text: "Call or WhatsApp the shop" },
];

export default function TrustStrip() {
  return (
    <section className="mx-auto mt-8 max-w-[1400px] px-4">
      <ul className="grid grid-cols-2 gap-3 rounded-box bg-neutral p-4 text-neutral-content md:grid-cols-4 md:p-5">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3">
            <Icon size={30} strokeWidth={1.5} className="shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-neutral-content/70">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
