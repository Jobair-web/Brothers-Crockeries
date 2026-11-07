"use client";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useWishlistStore } from "@/store/useWishlistStore";
import type { Product } from "@/types";

/** Local-first wishlist: instant UI update, mirrored to the API when the user is signed in. */
export function useWishlistActions() {
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);

  const toggle = useCallback(
    async (product: Product) => {
      const nowWishlisted = useWishlistStore.getState().toggle(product);
      toast.success(nowWishlisted ? "Added to wishlist" : "Removed from wishlist");
      if (!signedIn) return;
      try {
        await (nowWishlisted ? api.wishlist.add(product._id) : api.wishlist.remove(product._id));
      } catch {
        toast.error("Could not sync your wishlist. It is saved on this device.");
      }
    },
    [signedIn]
  );

  const remove = useCallback(
    async (id: string) => {
      useWishlistStore.getState().remove(id);
      toast.success("Removed from wishlist");
      if (!signedIn) return;
      try {
        await api.wishlist.remove(id);
      } catch {
        toast.error("Could not sync your wishlist. It is saved on this device.");
      }
    },
    [signedIn]
  );

  return { toggle, remove };
}
