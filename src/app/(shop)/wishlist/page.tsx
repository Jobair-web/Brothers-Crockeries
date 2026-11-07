"use client";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, X, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistActions } from "@/hooks/useWishlist";
import { useHydrated } from "@/hooks/useHydrated";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/format";
import type { Product, WishlistItem } from "@/types";

const toProduct = (i: WishlistItem, quantity: number = 1): Product => ({
  _id: i._id,
  slug: i.slug,
  title: i.title,
  price: i.price,
  originalPrice: i.originalPrice,
  discountPercent: i.discountPercent || 0,
  images: i.image ? [{ url: i.image }] : [],
  stock: i.stock,
  inStock: i.inStock,
  createdAt: "",
});

export default function WishlistPage() {
  const hydrated = useHydrated();
  const items = useWishlistStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const { remove } = useWishlistActions();

  // Local state to track quantity for each wishlist item by _id
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQty = (id: string) => quantities[id] || 1;

  const updateQty = (id: string, delta: number, stock: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const updated = current + delta;
      if (updated < 1) return prev;
      if (stock > 0 && updated > stock) return prev; // Don't exceed stock limit if applicable
      return { ...prev, [id]: updated };
    });
  };

  const handleAddToCart = async (item: WishlistItem) => {
    const qty = getQty(item._id);
    // Add to cart with quantity loop or if your cart store supports quantity
    for (let i = 0; i < qty; i++) {
      add(toProduct(item));
    }
    await remove(item._id);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <h1 className="text-3xl font-bold">
        Wishlist <span className="text-lg font-normal text-base-content/50">(পছন্দের তালিকা)</span>
      </h1>

      {!hydrated ? (
        <div className="mt-6 h-40 animate-pulse rounded-box bg-base-300/60" />
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-box border border-dashed border-base-300 bg-base-100 p-12 text-center">
          <Heart size={40} className="mx-auto text-base-content/30" />
          <p className="mt-3 font-semibold">Your wishlist is empty</p>
          <p className="text-sm text-base-content/60">Tap the heart on any product to save it here.</p>
          <Link href="/products" className="btn btn-primary btn-sm mt-4">Browse products</Link>
        </div>
      ) : (
        <>
          {/* Mobile View: Expected UI Layout */}
          <div className="mt-6 space-y-4 md:hidden">
            {items.map((item) => {
              const soldOut = !item.inStock || item.stock <= 0;
              const qty = getQty(item._id);

              return (
                <div key={item._id} className="relative rounded-2xl bg-white p-4 shadow-sm border border-base-200">
                  <div className="flex gap-3.5 items-start">
                    {/* Product Image with Heart Icon on top-right */}
                    <div className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-base-200">
                      <img src={item.image ?? PLACEHOLDER_IMAGE} alt={item.title} className="size-full object-cover" />
                      <button 
                        onClick={() => remove(item._id)} 
                        className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-white text-error shadow-md hover:bg-gray-100"
                      >
                        <Heart size={14} className="fill-error text-error" />
                      </button>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col">
                      <Link href={`/products/${item.slug}`} className="font-bold text-base text-gray-900 line-clamp-1 hover:text-secondary">
                        {item.title}
                      </Link>
                      
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {item.description || "Premium quality product with beautiful design."}
                      </p>

                      {soldOut && <p className="text-xs font-medium text-error mt-0.5">Out of stock</p>}

                      {/* Price Section */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-teal-800 text-base">{formatPrice(item.price * qty)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice * qty)}</span>
                        )}
                      </div>

                      {/* Discount Badge */}
                      {item.discountPercent > 0 && (
                        <div className="mt-1">
                          <span className="inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                            {item.discountPercent}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row: Quantity Counter, Delete & Add to Cart */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-gray-100 pt-3">
                    {/* Working Quantity Selector */}
                    <div className="flex items-center rounded-xl bg-teal-50/50 px-2 py-1 border border-teal-100">
                      <button 
                        className="text-teal-900 hover:text-teal-700 p-1 disabled:opacity-40" 
                        onClick={() => updateQty(item._id, -1, item.stock)}
                        disabled={qty <= 1}
                        title="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-bold text-teal-900">{qty}</span>
                      <button 
                        className="text-teal-900 hover:text-teal-700 p-1" 
                        onClick={() => updateQty(item._id, 1, item.stock)}
                        title="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Delete Icon Button */}
                    <button 
                      onClick={() => remove(item._id)} 
                      className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-error hover:bg-red-100 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Add to Cart Button */}
                    <button 
                      className="btn btn-sm bg-[#0B3C36] hover:bg-[#072a26] text-white gap-1.5 rounded-xl px-4 border-none shadow-none" 
                      disabled={soldOut} 
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Bottom summary card with Clear All */}
            <div className="flex items-center justify-between rounded-2xl bg-teal-50/60 p-4 border border-teal-100">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                  <Heart size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{items.length} items in your wishlist</p>
                  <p className="text-xs text-gray-500">Save more, shop later!</p>
                </div>
              </div>
              
              <button 
                onClick={() => items.forEach((i) => remove(i._id))}
                className="btn btn-sm bg-[#0B3C36] hover:bg-[#072a26] text-white rounded-xl px-4 border-none"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Desktop & Tablet View: Table Layout */}
          <div className="mt-6 hidden md:block overflow-x-auto rounded-box border border-base-300/70 bg-base-100">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-10"><span className="sr-only">Remove</span></th>
                  <th colSpan={2}>Product</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const soldOut = !item.inStock || item.stock <= 0;
                  return (
                    <tr key={item._id} className="hover:bg-base-200/40">
                      <td>
                        <button onClick={() => remove(item._id)} aria-label={`Remove ${item.title} from wishlist`} className="text-error hover:scale-110">
                          <X size={18} />
                        </button>
                      </td>
                      <td className="w-20">
                        <img src={item.image ?? PLACEHOLDER_IMAGE} alt="" className="size-16 rounded-lg object-cover" />
                      </td>
                      <td>
                        <Link href={`/products/${item.slug}`} className="font-medium hover:text-secondary">{item.title}</Link>
                        {soldOut && <p className="text-xs font-medium text-error">Out of stock</p>}
                      </td>
                      <td className="text-right">
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="mr-2 text-xs text-base-content/45 line-through">{formatPrice(item.originalPrice)}</span>
                        )}
                        <span className="font-bold text-accent">{formatPrice(item.price)}</span>
                      </td>
                      <td>
                        <div className="flex flex-wrap justify-end gap-2">
                          <button className="btn btn-sm btn-outline btn-secondary gap-1.5" disabled={soldOut} onClick={() => add(toProduct(item))}>
                            <ShoppingCart size={14} /> Add to cart
                          </button>
                          <button className="btn btn-sm btn-primary gap-1.5" disabled={soldOut} onClick={() => { add(toProduct(item)); remove(item._id); }}>
                            <Trash2 size={14} /> Move to cart
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}