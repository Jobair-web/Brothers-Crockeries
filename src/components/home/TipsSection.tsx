import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TIPS } from "@/lib/tips";

export default function TipsSection() {
  return (
    <section className="mx-auto mt-14 max-w-[1400px] px-4" aria-labelledby="tips-title">
      <h2 id="tips-title" className="text-2xl font-bold">যত্ন ও ব্যবহারের টিপস</h2>
      <p className="text-sm text-base-content/60">Care guides to help your cookware and appliances last longer.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TIPS.map((t) => (
          <Link key={t.slug} href={`/tips/${t.slug}`} className="group flex flex-col rounded-box border border-base-300/70 bg-base-100 p-5 transition-shadow hover:shadow-lg hover:shadow-primary/15">
            <h3 className="font-semibold leading-snug">{t.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-base-content/65">{t.summary}</p>
            <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-secondary">Read <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
