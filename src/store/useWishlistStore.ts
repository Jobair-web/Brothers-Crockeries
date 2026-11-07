"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, WishlistItem } from "@/types";

export const toWishlistItem = (p: Product): WishlistItem => ({
  _id: p._id,
  slug: p.slug,
  title: p.title,
  price: p.price,
  originalPrice: p.originalPrice,
  image: p.images?.[0]?.url,
  inStock: p.inStock,
  stock: p.stock,
});

interface WishlistState {
  items: WishlistItem[];
  toggle: (product: Product) => boolean; // returns true when the product is now wishlisted
  remove: (id: string) => void;
  setItems: (products: Product[]) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some((i) => i._id === product._id);
        set({ items: exists ? get().items.filter((i) => i._id !== product._id) : [toWishlistItem(product), ...get().items] });
        return !exists;
      },
      remove: (id) => set({ items: get().items.filter((i) => i._id !== id) }),
      setItems: (products) => set({ items: products.map(toWishlistItem) }),
      clear: () => set({ items: [] }),
    }),
    { name: "bc-wishlist", partialize: (s) => ({ items: s.items }) }
  )
);
