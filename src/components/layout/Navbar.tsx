"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, Info, LayoutDashboard, LogIn, LogOut, Menu, Phone, ReceiptText, ShoppingBag, ShoppingCart, UserPlus, X,
} from "lucide-react";
import SearchBar from "./SearchBar";
import { signOut, useSession } from "@/lib/auth-client";
import { useHydrated } from "@/hooks/useHydrated";
import { cartCount, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { STORE } from "@/lib/constants";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="badge badge-primary badge-sm indicator-item font-semibold">{count > 99 ? "99+" : count}</span>;
}

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5" aria-label={STORE.name} onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" className="h-9 w-auto shrink-0 drop-shadow-[0_0_8px_rgba(25,191,220,0.45)] sm:h-10" />
      <span className="font-brand leading-[1.05]">
        <span className="block bg-gradient-to-r from-primary to-sky-200 bg-clip-text text-[12px] font-extrabold tracking-[0.14em] text-transparent sm:text-[15px] sm:tracking-[0.18em]">BROTHERS</span>
        <span className="block text-[9px] font-semibold tracking-[0.22em] text-white sm:text-[11.5px] sm:tracking-[0.3em]">CROCKERIES</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartItems = useCartStore((s) => cartCount(s.items));
  const openCart = useCartStore((s) => s.open);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const user = session?.user;

  const closeMenu = () => setMenuOpen(false);
  const blurActive = () => (document.activeElement as HTMLElement | null)?.blur();

  const handleSignOut = async () => {
    await signOut();
    useWishlistStore.getState().clear();
    blurActive();
    closeMenu();
    router.push("/");
    router.refresh();
  };

  const linkCls = "rounded-lg px-3 py-2 text-sm font-medium text-neutral-content/90 transition-colors hover:bg-white/10 hover:text-white";
  const iconBtn = "grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-primary";
  const menuRow = "flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/10";

  return (
    <header className="sticky top-0 z-40 bg-[#0b3d3a] text-neutral-content shadow-lg shadow-black/20 lg:bg-neutral lg:shadow-neutral/20">
      {/* ===== Mobile: hamburger + logo + search in ONE row ===== */}
      <div className="flex h-16 items-center gap-2 px-3 lg:hidden">
        <button
          className={`${iconBtn} -ml-1 shrink-0`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Brand onClick={closeMenu} />
        <div className="min-w-0 flex-1">
          <Suspense fallback={<div className="h-10 rounded-lg bg-white/10" />}>
            <SearchBar onNavigate={closeMenu} />
          </Suspense>
        </div>
      </div>

      {/* ===== Desktop ===== */}
      <div className="mx-auto hidden h-16 max-w-350 items-center gap-5 px-4 lg:flex">
        <Brand />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="max-w-xl flex-1">
            <Suspense fallback={<div className="h-10 rounded-lg bg-white/10" />}>
              <SearchBar />
            </Suspense>
          </div>
          <Link href="/about-us" className={linkCls}>About Us</Link>
          <Link href="/contact-us" className={linkCls}>Contact Us</Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/wishlist" className={iconBtn} aria-label="Wishlist">
            <div className="indicator">
              <Heart size={22} />
              {hydrated && <Badge count={wishlistCount} />}
            </div>
          </Link>
         <button className={iconBtn} aria-label="Open cart" onClick={openCart} data-cart-target>
            <div className="indicator">
              <ShoppingCart size={22} />
              {hydrated && <Badge count={cartItems} />}
            </div>
          </button>

          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-primary btn-sm h-10 gap-2 rounded-full px-3">
                <span className="grid size-6 place-items-center rounded-full bg-neutral text-xs font-bold text-primary">{user.name?.[0]?.toUpperCase() ?? "U"}</span>
                <span className="max-w-24 truncate">{user.name?.split(" ")[0]}</span>
              </div>
              <ul tabIndex={0} className="menu dropdown-content z-50 mt-3 w-56 rounded-box bg-base-100 p-2 text-base-content shadow-xl">
                {user.role === "admin" && (
                  <li><Link href="/admin/dashboard" onClick={blurActive}><LayoutDashboard size={16} /> Admin panel</Link></li>
                )}
                <li><Link href="/orders" onClick={blurActive}><ReceiptText size={16} /> My orders</Link></li>
                <li><Link href="/wishlist" onClick={blurActive}><Heart size={16} /> My wishlist</Link></li>
                <li><button onClick={handleSignOut}><LogOut size={16} /> Sign out</button></li>
              </ul>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm h-10 gap-2 rounded-full px-4">
              <LogIn size={16} /> <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* ===== Mobile hamburger menu: account + pages (wishlist/cart are in the bottom bar) ===== */}
      {menuOpen && (
        <nav aria-label="Mobile menu" className="max-h-[calc(100dvh-8rem)] overflow-y-auto border-t border-white/10 px-4 pb-4 pt-3 lg:hidden">
          {user ? (
            <div className="mb-2 rounded-box bg-white/5 p-3">
              <div className="flex items-center gap-3 px-1 pb-2">
                <span className="grid size-10 place-items-center rounded-full bg-primary text-base font-bold text-primary-content">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-neutral-content/60">{user.role === "admin" ? "Admin account" : "My account"}</p>
                </div>
              </div>
              {user.role === "admin" && (
                <Link href="/admin/dashboard" className={menuRow} onClick={closeMenu}><LayoutDashboard size={18} /> Admin panel</Link>
              )}
              <Link href="/orders" className={menuRow} onClick={closeMenu}><ReceiptText size={18} /> My orders</Link>
              <button className={`${menuRow} w-full`} onClick={handleSignOut}><LogOut size={18} /> Sign out</button>
            </div>
          ) : (
            <div className="mb-2 grid grid-cols-2 gap-3">
              <Link href="/login" className="btn btn-primary h-11" onClick={closeMenu}><LogIn size={16} /> Login</Link>
              <Link href="/register" className="btn btn-outline h-11 border-white/40 text-white hover:bg-white hover:text-neutral" onClick={closeMenu}>
                <UserPlus size={16} /> Register
              </Link>
            </div>
          )}

          <Link href="/products" className={menuRow} onClick={closeMenu}><ShoppingBag size={18} /> All Products</Link>
          <Link href="/about-us" className={menuRow} onClick={closeMenu}><Info size={18} /> About Us</Link>
          <Link href="/contact-us" className={menuRow} onClick={closeMenu}><Phone size={18} /> Contact Us</Link>
        </nav>
      )}
    </header>
  );
}