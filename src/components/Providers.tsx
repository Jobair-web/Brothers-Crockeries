"use client";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useWishlistStore } from "@/store/useWishlistStore";

/** After sign-in: merge the guest wishlist into the account and load the account list. */
function WishlistSync() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const localIds = useWishlistStore.getState().items.map((i) => i._id);
        const { products } = await api.wishlist.merge(localIds);
        if (!cancelled) useWishlistStore.getState().setItems(products);
      } catch {
        /* offline or API down: keep the local list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WishlistSync />
      <ToastContainer position="top-right" autoClose={2500} closeOnClick pauseOnHover theme="colored" />
    </>
  );
}
