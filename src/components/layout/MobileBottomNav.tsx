"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, ShoppingCart, User } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useHydrated } from "@/hooks/useHydrated";
import { cartCount, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

function Count({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-2.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-warning px-1 text-[11px] font-bold leading-none text-warning-content">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { data: session } = useSession();
  const cartItems = useCartStore((s) => cartCount(s.items));
  const cartOpen = useCartStore((s) => s.isOpen);
  const openCart = useCartStore((s) => s.open);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const tab = "flex flex-1 flex-col items-center gap-1 py-2.5 text-[12px] font-medium transition-colors";
  const on = "text-primary";
  const off = "text-white/85 hover:text-white";

  const accountHref = session?.user ? "/orders" : "/login";
  const accountActive = ["/orders", "/login", "/register"].some((p) => pathname.startsWith(p));

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex bg-[#0b3d3a] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.25)] lg:hidden"
    >
      <Link href="/" className={`${tab} ${pathname === "/" && !cartOpen ? on : off}`} aria-current={pathname === "/" ? "page" : undefined}>
        <House size={26} strokeWidth={1.8} />
        Home
      </Link>

      <Link href="/wishlist" className={`${tab} ${pathname.startsWith("/wishlist") && !cartOpen ? on : off}`}>
        <span className="relative">
          <Heart size={26} strokeWidth={1.8} />
          {hydrated && <Count n={wishlistCount} />}
        </span>
        Wishlist
      </Link>

   <button type="button" onClick={openCart} className={`${tab} ${cartOpen ? on : off}`} aria-label="Open cart" data-cart-target>
        <span className="relative">
          <ShoppingCart size={26} strokeWidth={1.8} />
          {hydrated && <Count n={cartItems} />}
        </span>
        Cart
      </button>

      <Link href={accountHref} className={`${tab} ${accountActive && !cartOpen ? on : off}`}>
        <User size={26} strokeWidth={1.8} />
        Account
      </Link>
    </nav>
  );
}