"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { cartSubtotal, useCartStore } from "@/store/useCartStore";
import { useHydrated } from "@/hooks/useHydrated";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/format";

export default function CartDrawer() {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const { items, isOpen, close, setQuantity, remove } = useCartStore();
  const subtotal = cartSubtotal(items);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Stop the page behind the drawer from scrolling while it is open
  useEffect(() => {
    document.documentElement.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-[visibility] duration-300 ${isOpen ? "visible" : "pointer-events-none invisible"}`}
      aria-hidden={!isOpen}
    >
      <div onClick={close} className={`absolute inset-0 bg-neutral/60 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} />

      {/* The drawer is exactly as tall as the screen; only the item list scrolls */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-dvh max-h-dvh w-full max-w-md flex-col overflow-hidden bg-base-100 shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-base-300 px-4 py-3 sm:px-6">
          <h2 className="text-lg font-bold">
            Shopping cart
            {hydrated && items.length > 0 && <span className="ml-2 text-sm font-normal text-base-content/55">({items.length})</span>}
          </h2>
          <button onClick={close} className="btn btn-ghost btn-circle btn-sm" aria-label="Close cart"><X size={20} /></button>
        </header>

        {!hydrated || items.length === 0 ? (
          <div className="grid min-h-0 flex-1 place-items-center px-6 text-center">
            <div>
              <ShoppingBag size={44} className="mx-auto text-base-content/30" />
              <p className="mt-3 font-medium">Your cart is empty</p>
              <p className="text-sm text-base-content/60">Add a product and it will show up here.</p>
              <Link href="/products" className="btn btn-primary btn-sm mt-4">Browse products</Link>
            </div>
          </div>
        ) : (
          <>
            {/* min-h-0 is what lets this list shrink and scroll instead of pushing the footer off-screen */}
            <ul className="min-h-0 flex-1 divide-y divide-base-200 overflow-y-auto overflow-x-hidden overscroll-contain px-4 sm:px-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image ?? PLACEHOLDER_IMAGE} alt="" className="size-16 shrink-0 rounded-lg bg-base-200 object-cover sm:size-20" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${item.slug}`} className="line-clamp-2 min-w-0 text-sm font-medium hover:text-secondary">{item.title}</Link>
                      <button onClick={() => remove(item.productId)} aria-label={`Remove ${item.title}`} className="shrink-0 text-error"><X size={16} /></button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <div className="join border border-base-300">
                        <button className="btn btn-ghost btn-xs join-item" aria-label="Decrease" onClick={() => setQuantity(item.productId, item.quantity - 1)}><Minus size={14} /></button>
                        <span className="join-item grid w-9 place-items-center text-sm font-semibold">{item.quantity}</span>
                        <button className="btn btn-ghost btn-xs join-item" aria-label="Increase" onClick={() => setQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.maxQty}><Plus size={14} /></button>
                      </div>
                      <p className="whitespace-nowrap text-sm text-base-content/70">
                        {item.quantity} × <span className="font-bold text-accent">{formatPrice(item.price)}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer is compact and never shrinks, so Checkout is always on screen */}
            <footer className="shrink-0 space-y-2 border-t border-base-300 bg-base-200/60 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
              <p className="flex items-center justify-between text-lg font-bold">
                <span>Subtotal</span><span className="text-accent">{formatPrice(subtotal)}</span>
              </p>
              <p className="text-xs text-base-content/60">Shipping is calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-2">
                {/* <Link href="/cart" className="btn btn-outline">View cart</Link> */}
               <Link href="/products" onClick={close} className="btn border-0 bg-[#0b3d3a] font-semibold text-white hover:bg-[#0b3d3a]/90 sm:hidden">Continue shopping</Link>
<Link href="/cart" className="btn btn-secondary max-sm:hidden">View cart</Link>
                <Link href="/checkout" className="btn btn-accent">Checkout</Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}