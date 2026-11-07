"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Banknote, Package, ReceiptText, Users, type LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import { OrderBadge } from "@/components/admin/StatusBadge";
import type { Order } from "@/types";

type Stats = Awaited<ReturnType<typeof api.admin.stats>>["stats"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin.stats().then((r) => { setStats(r.stats); setRecent(r.recentOrders); }).catch((e: Error) => setError(e.message));
  }, []);

  const cards: { label: string; value: string | number; icon: LucideIcon; hint?: string }[] = stats
    ? [
        { label: "Revenue (completed orders)", value: formatPrice(stats.revenue), icon: Banknote },
        { label: "Orders", value: stats.orders, icon: ReceiptText, hint: `${stats.pendingOrders} pending` },
        { label: "Products", value: stats.products, icon: Package, hint: `${stats.lowStock} low or out of stock` },
        { label: "Customers", value: stats.users, icon: Users },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {error && <div role="alert" className="alert alert-error alert-soft mt-4">{error}</div>}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats
          ? cards.map(({ label, value, icon: Icon, hint }) => (
              <div key={label} className="rounded-box bg-base-100 p-5">
                <div className="flex items-center justify-between text-base-content/60"><span className="text-sm">{label}</span><Icon size={18} /></div>
                <p className="mt-2 text-3xl font-bold">{value}</p>
                {hint && <p className="mt-1 text-xs text-base-content/55">{hint}</p>}
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-box bg-base-300/60" />)}
      </div>

      {stats && stats.pendingPayments > 0 && (
        <Link href="/admin/orders?status=Pending" className="mt-4 flex items-center gap-3 rounded-box bg-warning/15 px-4 py-3 text-sm font-medium hover:bg-warning/25">
          <AlertTriangle size={18} className="text-warning" /> {stats.pendingPayments} bKash / Nagad payment(s) waiting for verification
        </Link>
      )}

      <section className="mt-6 rounded-box bg-base-100 p-5">
        <div className="flex items-center justify-between"><h2 className="font-bold">Recent orders</h2><Link href="/admin/orders" className="text-sm font-medium text-secondary hover:underline">View all</Link></div>
        <div className="mt-3 overflow-x-auto">
          <table className="table table-sm">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o._id}>
                  <td className="font-mono text-xs">{o.orderNumber}</td>
                  <td>{o.billing.firstName} {o.billing.lastName}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td className="font-semibold">{formatPrice(o.total)}</td>
                  <td><OrderBadge status={o.status} /></td>
                </tr>
              ))}
              {stats && recent.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-base-content/55">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
