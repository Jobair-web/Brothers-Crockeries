import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TIPS } from "@/lib/tips";

export function generateStaticParams() {
  return TIPS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: TIPS.find((t) => t.slug === slug)?.title ?? "Tips" };
}

export default async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tip = TIPS.find((t) => t.slug === slug);
  if (!tip) notFound();

  return (
    <article className="mx-auto max-w-[720px] px-4 py-10">
      <Link href="/" className="text-sm text-secondary hover:underline">← Back to home</Link>
      <h1 className="mt-3 text-3xl font-bold leading-snug">{tip.title}</h1>
      <p className="mt-2 text-base-content/70">{tip.summary}</p>
      <ul className="mt-6 space-y-3">
        {tip.points.map((p) => (
          <li key={p} className="rounded-box border border-base-300/70 bg-base-100 p-4 leading-relaxed">{p}</li>
        ))}
      </ul>
      <nav aria-label="More tips" className="mt-10 flex flex-wrap gap-2">
        {TIPS.filter((t) => t.slug !== slug).map((t) => (
          <Link key={t.slug} href={`/tips/${t.slug}`} className="btn btn-sm btn-outline">{t.title}</Link>
        ))}
      </nav>
    </article>
  );
}
