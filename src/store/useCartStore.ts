"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (product, quantity = 1) => {
        if (!product.inStock || product.stock <= 0) {
          toast.error("This product is out of stock");
          return;
        }
        const existing = get().items.find((i) => i.productId === product._id);
        if (existing && existing.quantity >= existing.maxQty) {
          toast.info(`Only ${existing.maxQty} available in stock`);
          return;
        }
        if (existing) {
          set({ items: get().items.map((i) => (i.productId === product._id ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxQty) } : i)) });
        } else {
          set({
            items: [
              ...get().items,
              {
                productId: product._id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images?.[0]?.url,
                quantity: Math.min(quantity, product.stock),
                maxQty: product.stock,
              },
            ],
          });
        }
        toast.success("Added to cart");
      },
      setQuantity: (productId, quantity) =>
        set({
          items: get().items.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQty)) } : i)),
        }),
      remove: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "bc-cart", partialize: (s) => ({ items: s.items }) }
  )
);
