"use client";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { cartSubtotal, useCartStore } from "@/store/useCartStore";
import { useHydrated } from "@/hooks/useHydrated";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/format";

export default function CartPage() {
  const hydrated = useHydrated();
  const { items, setQuantity, remove, clear } = useCartStore();
  const subtotal = cartSubtotal(items);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <h1 className="text-3xl font-bold">Shopping cart</h1>

      {!hydrated ? (
        <div className="mt-6 h-40 animate-pulse rounded-box bg-base-300/60" />
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-box border border-dashed border-base-300 bg-base-100 p-12 text-center">
          <ShoppingBag size={40} className="mx-auto text-base-content/30" />
          <p className="mt-3 font-semibold">Your cart is empty</p>
          <Link href="/products" className="btn btn-primary btn-sm mt-4">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="overflow-x-auto rounded-box border border-base-300/70 bg-base-100">
            <table className="table">
              <thead><tr><th colSpan={2}>Product</th><th>Price</th><th>Quantity</th><th className="text-right">Total</th><th /></tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.productId}>
                    <td className="w-20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.image ?? PLACEHOLDER_IMAGE} alt="" className="size-16 rounded-lg object-cover" />
                    </td>
                    <td><Link href={`/products/${i.slug}`} className="font-medium hover:text-secondary">{i.title}</Link></td>
                    <td>{formatPrice(i.price)}</td>
                    <td>
                      <div className="join border border-base-300">
                        <button className="btn btn-ghost btn-xs join-item" aria-label="Decrease" onClick={() => setQuantity(i.productId, i.quantity - 1)}><Minus size={14} /></button>
                        <span className="join-item grid w-9 place-items-center text-sm font-semibold">{i.quantity}</span>
                        <button className="btn btn-ghost btn-xs join-item" aria-label="Increase" disabled={i.quantity >= i.maxQty} onClick={() => setQuantity(i.productId, i.quantity + 1)}><Plus size={14} /></button>
                      </div>
                    </td>
                    <td className="text-right font-bold text-accent">{formatPrice(i.price * i.quantity)}</td>
                    <td><button onClick={() => remove(i.productId)} aria-label={`Remove ${i.title}`} className="text-error"><X size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="h-fit space-y-3 rounded-box border border-base-300/70 bg-base-100 p-5">
            <h2 className="text-lg font-bold">Order summary</h2>
            <p className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></p>
            <p className="text-xs text-base-content/60">Shipping (Dhaka ৳80, Chattogram ৳70, others ৳150) is added at checkout.</p>
            <Link href="/checkout" className="btn btn-accent w-full">Proceed to checkout</Link>
            <Link href="/products" className="btn btn-ghost btn-sm w-full">Continue shopping</Link>
            <button onClick={clear} className="w-full text-center text-xs text-error hover:underline">Clear cart</button>
          </aside>
        </div>
      )}
    </div>
  );
}
