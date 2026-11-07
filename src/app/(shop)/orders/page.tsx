"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ReceiptText } from "lucide-react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate, formatPrice } from "@/lib/format";
import { OrderBadge, PaymentBadge } from "@/components/admin/StatusBadge";
import type { Order } from "@/types";

export default function MyOrdersPage() {
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    api.orders.mine().then((r) => setOrders(r.orders)).catch((e: Error) => setError(e.message));
  }, [userId]);

  if (isPending) return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-secondary" /></div>;
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ReceiptText size={40} className="mx-auto text-base-content/30" />
        <p className="mt-3 font-semibold">Sign in to see your orders</p>
        <Link href="/login?redirect=/orders" className="btn btn-primary btn-sm mt-4">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <h1 className="text-3xl font-bold">My orders</h1>
      {error && <div role="alert" className="alert alert-error alert-soft mt-4">{error}</div>}
      {orders === null && !error && <div className="mt-6 h-32 animate-pulse rounded-box bg-base-300/60" />}
      {orders?.length === 0 && (
        <div className="mt-6 rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center">
          <p className="font-semibold">No orders yet</p>
          <p className="text-sm text-base-content/60">Orders placed while signed in appear here.</p>
          <Link href="/products" className="btn btn-primary btn-sm mt-4">Start shopping</Link>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {orders?.map((o) => {
          const dest = o.shipToDifferentAddress && o.shipping ? o.shipping : null;
          return (
            <li key={o._id} className="rounded-box border border-base-300/70 bg-base-100 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><p className="font-mono text-sm font-semibold">{o.orderNumber}</p><p className="text-xs text-base-content/55">{formatDate(o.createdAt)}</p></div>
                <div className="flex items-center gap-2"><PaymentBadge status={o.paymentStatus} /><OrderBadge status={o.status} /></div>
              </div>
              <ul className="mt-3 divide-y divide-base-200 text-sm">
                {o.items.map((i) => (
                  <li key={i.product} className="flex justify-between gap-3 py-2"><span>{i.title} × {i.quantity}</span><span>{formatPrice(i.price * i.quantity)}</span></li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-t border-base-200 pt-3 text-sm">
                <p className="text-base-content/65">
                  Deliver to: {dest ? `${dest.firstName} ${dest.lastName}, ${dest.address}, ${dest.city}` : `${o.billing.address}, ${o.billing.city}`}
                </p>
                <p className="text-right"><span className="text-xs text-base-content/55">Shipping {formatPrice(o.shippingCost)}</span><br /><span className="text-lg font-bold text-accent">{formatPrice(o.total)}</span></p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
