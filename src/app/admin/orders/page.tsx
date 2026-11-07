"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Eye, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import { OrderBadge, PaymentBadge } from "@/components/admin/StatusBadge";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["Pending", "Processing", "Completed", "Cancelled"];

function OrderDetails({ order, onClose }: { order: Order; onClose: () => void }) {
  const b = order.billing;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-start justify-between">
          <div><h2 className="text-xl font-bold">Order {order.orderNumber}</h2><p className="text-sm text-base-content/60">{formatDate(order.createdAt)}</p></div>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold">Customer</p>
            <p>{b.firstName} {b.lastName}</p>
            <p>{b.phone}</p>
            {b.email && <p>{b.email}</p>}
            <p className="mt-2 font-semibold">Address</p>
            <p>{b.address}{b.apartment && `, ${b.apartment}`}</p>
            <p>{b.city}, {b.district} {b.postcode}</p>
            {order.shipToDifferentAddress && order.shipping && (
              <>
                <p className="mt-2 font-semibold">Ship to (different address)</p>
                <p>{order.shipping.firstName} {order.shipping.lastName} · {order.shipping.phone}</p>
                <p>{order.shipping.address}{order.shipping.apartment && `, ${order.shipping.apartment}`}</p>
                <p>{order.shipping.city}, {order.shipping.district} {order.shipping.postcode}</p>
              </>
            )}
          </div>
          <div>
            <p className="font-semibold">Payment</p>
            <p>{order.paymentMethod === "cod" ? "Cash on delivery" : "bKash / Nagad"} <PaymentBadge status={order.paymentStatus} /></p>
            {order.payment?.senderNumber && <p>From: {order.payment.senderNumber}</p>}
            {order.payment?.transactionId && <p>TrxID: <span className="font-mono">{order.payment.transactionId}</span></p>}
            {order.notes && <><p className="mt-2 font-semibold">Notes</p><p>{order.notes}</p></>}
          </div>
        </div>
        <table className="table table-sm mt-4">
          <thead><tr><th>Item</th><th>Qty</th><th className="text-right">Total</th></tr></thead>
          <tbody>
            {order.items.map((i) => <tr key={i.product}><td>{i.title}</td><td>{i.quantity}</td><td className="text-right">{formatPrice(i.price * i.quantity)}</td></tr>)}
            <tr><td colSpan={2} className="text-right">Shipping ({order.shippingZone})</td><td className="text-right">{formatPrice(order.shippingCost)}</td></tr>
            <tr className="font-bold"><td colSpan={2} className="text-right">Total</td><td className="text-right">{formatPrice(order.total)}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}

function OrdersView() {
  const initialStatus = useSearchParams().get("status") ?? "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Order | null>(null);
  const debounced = useDebounce(search, 350);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.orders.list({ page, status, search: debounced });
      setOrders(r.orders);
      setTotalPages(Math.max(r.totalPages, 1));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, status, debounced]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => setPage(1), [status, debounced]);

  const patch = (updated: Order) => setOrders((list) => list.map((o) => (o._id === updated._id ? updated : o)));

  const changeStatus = async (o: Order, next: OrderStatus) => {
    try {
      const { order } = await api.orders.setStatus(o._id, next);
      patch(order);
      toast.success(`Order ${o.orderNumber} is now ${next}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const verify = async (o: Order, action: "verify" | "reject") => {
    try {
      const { order } = await api.orders.verifyPayment(o._id, action);
      patch(order);
      toast.success(action === "verify" ? "Payment verified" : "Payment rejected");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div role="tablist" className="tabs tabs-box">
          {["", ...STATUSES].map((s) => (
            <button key={s || "all"} role="tab" aria-selected={status === s} className={`tab ${status === s ? "tab-active" : ""}`} onClick={() => setStatus(s)}>{s || "All"}</button>
          ))}
        </div>
        <label className="input input-bordered input-sm ml-auto flex items-center gap-2">
          <Search size={14} className="text-base-content/50" />
          <input className="grow" placeholder="Order no., name or phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search orders" />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-box bg-base-100">
        <table className="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th /></tr></thead>
          <tbody className={loading ? "opacity-60" : ""}>
            {orders.map((o) => (
              <tr key={o._id}>
                <td><p className="font-mono text-xs">{o.orderNumber}</p><p className="text-xs text-base-content/55">{formatDate(o.createdAt)}</p></td>
                <td><p className="font-medium">{o.billing.firstName} {o.billing.lastName}</p><p className="text-xs text-base-content/55">{o.billing.phone}</p></td>
                <td className="font-semibold">{formatPrice(o.total)}</td>
                <td>
                  <p className="text-xs">{o.paymentMethod === "cod" ? "Cash on delivery" : "bKash / Nagad"}</p>
                  <PaymentBadge status={o.paymentStatus} />
                  {o.paymentStatus === "pending_verification" && (
                    <div className="mt-1 flex gap-1">
                      <button className="btn btn-success btn-xs gap-1" onClick={() => verify(o, "verify")}><Check size={12} /> Verify</button>
                      <button className="btn btn-error btn-outline btn-xs" onClick={() => verify(o, "reject")}>Reject</button>
                    </div>
                  )}
                </td>
                <td>
                  <select aria-label={`Status for ${o.orderNumber}`} className="select select-sm" value={o.status} onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <div className="mt-1"><OrderBadge status={o.status} /></div>
                </td>
                <td><button className="btn btn-ghost btn-sm btn-square" onClick={() => setViewing(o)} aria-label={`View ${o.orderNumber}`}><Eye size={16} /></button></td>
              </tr>
            ))}
            {!loading && orders.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-base-content/55">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-base-content/60">Page {page} of {totalPages}</span>
          <div className="join">
            <button className="btn btn-sm join-item" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <button className="btn btn-sm btn-primary join-item" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {viewing && <OrderDetails order={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersView />
    </Suspense>
  );
}
