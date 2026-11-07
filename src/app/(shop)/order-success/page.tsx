import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { STORE } from "@/lib/constants";

async function Content({ searchParams }: { searchParams: Promise<{ order?: string; method?: string }> }) {
  const { order, method } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle2 size={56} className="mx-auto text-success" />
      <h1 className="mt-4 text-3xl font-bold">Thank you for your order</h1>
      {order && <p className="mt-2 text-lg">Order number: <strong className="font-mono">{order}</strong></p>}
      <p className="mt-3 text-base-content/70">
        {method === "bkash_nagad"
          ? "We will verify your bKash / Nagad payment shortly and then start processing your order."
          : "Our team will call you to confirm the order. Please keep the cash ready for delivery."}
      </p>
      <p className="mt-2 text-sm text-base-content/60">Questions? Call {STORE.phones[0].number} ({STORE.phones[0].label}).</p>
      <Link href="/products" className="btn btn-primary mt-6">Continue shopping</Link>
    </div>
  );
}

export default function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string; method?: string }> }) {
  return (
    <Suspense fallback={null}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
