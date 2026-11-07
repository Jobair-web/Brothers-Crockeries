import { STORE, SHIPPING_ZONES } from "@/lib/constants";

// NOTE: confirm the exchange/return answer with the shop before launch.
const FAQS = [
  {
    q: "Which payment methods do you accept?",
    a: "You can pay by bKash / Nagad (send money, then enter your TrxID at checkout) or choose Cash on Delivery.",
  },
  {
    q: "How much is delivery?",
    a: `Delivery is ৳${SHIPPING_ZONES.dhaka.cost} inside Dhaka, ৳${SHIPPING_ZONES.chattogram.cost} inside Chattogram and ৳${SHIPPING_ZONES.others.cost} for the rest of Bangladesh. The charge is shown before you place the order.`,
  },
  {
    q: "Can I buy in wholesale?",
    a: "Yes. The shop sells both retail and wholesale. For wholesale prices, call or WhatsApp us on the numbers in the Contact page.",
  },
  {
    q: "What if my product has a problem?",
    a: `Contact the shop as soon as you receive your order and keep the product and its packaging. You can reach us on ${STORE.phones[0].number}, ${STORE.phones[1].number} or ${STORE.phones[2].number}.`,
  },
];

export default function FaqSection() {
  return (
    <section className="mx-auto my-14 grid max-w-[1100px] gap-8 px-4 md:grid-cols-[1fr_1.3fr]" aria-labelledby="faq-title">
      <div>
        <h2 id="faq-title" className="text-2xl font-bold leading-snug sm:text-3xl">Questions before you order?</h2>
        <p className="mt-3 text-base-content/65">Quick answers about payment, delivery and wholesale. Anything else, just call the shop.</p>
      </div>
      <div className="divide-y divide-base-300 border-y border-base-300">
        {FAQS.map((f, i) => (
          <details key={f.q} name="faq" open={i === 0} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-xl leading-none text-secondary transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-base-content/70">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
