"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Heart, Info, LayoutDashboard, LogIn, LogOut, Menu, Phone, ReceiptText, ShoppingBag, ShoppingCart, UserPlus, X,
} from "lucide-react";
import SearchBar from "./SearchBar";
import { api } from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { useHydrated } from "@/hooks/useHydrated";
import { cartCount, useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { STORE } from "@/lib/constants";
import type { Category } from "@/types";

// Order inquiry number shown in the header (WhatsApp)
const INQUIRY_NUMBER = "01898415482";
const INQUIRY_WHATSAPP = `https://wa.me/88${INQUIRY_NUMBER}`;

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

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
  // null = not loaded yet, [] = loaded but empty (or failed)
  const [categories, setCategories] = useState<Category[] | null>(null);

  const cartItems = useCartStore((s) => cartCount(s.items));
  const openCart = useCartStore((s) => s.open);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const user = session?.user;

  const closeMenu = () => setMenuOpen(false);
  const blurActive = () => (document.activeElement as HTMLElement | null)?.blur();

  // Slide-in menu: Escape closes it, and the page behind does not scroll while it is open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  // Load the categories the first time the menu is opened
  useEffect(() => {
    if (!menuOpen || categories !== null) return;
    let cancelled = false;
    api.categories
      .list()
      .then((r) => !cancelled && setCategories(r.categories))
      .catch(() => !cancelled && setCategories([]));
    return () => {
      cancelled = true;
    };
  }, [menuOpen, categories]);

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
  const drawerRow = "flex items-center gap-3 rounded-xl px-3 py-3.5 text-[16px] font-medium text-base-content transition-colors hover:bg-base-200 active:bg-base-200";
  const categoryRow = "flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-base-content transition-colors hover:bg-base-200 active:bg-base-200";

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0b3d3a] text-neutral-content shadow-lg shadow-black/20 lg:bg-neutral lg:shadow-neutral/20">
        {/* ===== Mobile: hamburger + logo + search in ONE row ===== */}
        <div className="flex h-16 items-center gap-2 px-3 lg:hidden">
          <button
            className={`${iconBtn} -ml-1 shrink-0`}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Menu size={24} />
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

          {/* extra space between the logo and the search bar */}
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:ml-3 xl:ml-6">
            <div className="max-w-xl flex-1 xl:flex-[2]">
              <Suspense fallback={<div className="h-10 rounded-lg bg-white/10" />}>
                <SearchBar />
              </Suspense>
            </div>
            <Link href="/about-us" className={linkCls}>About Us</Link>
            <Link href="/contact-us" className={linkCls}>Contact Us</Link>

            {/* Order inquiry: sits in the empty space between "Contact Us" and the icons */}
            <div className="hidden flex-1 justify-center xl:flex">
              <a
                href={INQUIRY_WHATSAPP}
                target="_blank"
                rel="noopener"
                aria-label={`Order inquiry on WhatsApp ${INQUIRY_NUMBER}`}
                className="rounded-lg px-3 py-1 leading-tight transition-colors hover:bg-white/10"
              >
                <span className="block text-[12px] font-medium text-primary">Order inquiry</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[18px] font-bold tracking-wide text-white">
                  <WhatsAppIcon /> {INQUIRY_NUMBER}
                </span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
      </header>

      {/* ===== Mobile slide-in menu: starts right below the navbar (top-16 = navbar height) ===== */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-16 z-[60] overflow-hidden transition-[visibility] duration-300 lg:hidden ${menuOpen ? "visible" : "pointer-events-none invisible"}`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={closeMenu}
          className={`absolute inset-0 bg-neutral/60 backdrop-blur-[2px] transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          role="dialog"
          aria-label="Menu"
          className={`absolute inset-y-0 left-0 flex h-full w-[86%] max-w-sm flex-col bg-base-100 shadow-2xl transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-base-300 px-5 py-4">
            <h2 className="text-2xl font-bold">Menu</h2>
            <button onClick={closeMenu} aria-label="Close menu" className="btn btn-ghost btn-circle btn-sm"><X size={22} /></button>
          </div>

          {/* Search bar (suggestions open right below it, inside the menu) */}
          <div className="shrink-0 px-4 pt-4">
            <Suspense fallback={<div className="h-10 rounded-lg bg-base-200" />}>
              <SearchBar onNavigate={closeMenu} inDrawer />
            </Suspense>
          </div>

          {/* Order inquiry on WhatsApp */}
          <a
            href={INQUIRY_WHATSAPP}
            target="_blank"
            rel="noopener"
            onClick={closeMenu}
            aria-label={`Order inquiry on WhatsApp ${INQUIRY_NUMBER}`}
            className="mx-4 mt-3 flex shrink-0 items-center gap-3 rounded-xl border border-base-300 bg-base-200 px-3 py-2.5 transition-colors active:bg-base-300"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-sm">
              <WhatsAppIcon size={24} />
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-medium text-secondary">Order inquiry</span>
              <span className="block text-[19px] font-bold tracking-wide text-base-content">{INQUIRY_NUMBER}</span>
            </span>
          </a>

          <nav aria-label="Mobile menu" className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
            {user && (
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-base-200 px-3 py-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-content">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="text-xs text-base-content/60">{user.role === "admin" ? "Admin account" : "My account"}</p>
                </div>
              </div>
            )}

            {user?.role === "admin" && (
              <Link href="/admin/dashboard" className={drawerRow} onClick={closeMenu}><LayoutDashboard size={20} className="text-secondary" /> Admin panel</Link>
            )}
            {user && <Link href="/orders" className={drawerRow} onClick={closeMenu}><ReceiptText size={20} className="text-secondary" /> My orders</Link>}
            <Link href="/products" className={drawerRow} onClick={closeMenu}><ShoppingBag size={20} className="text-secondary" /> All Products</Link>
            <Link href="/about-us" className={drawerRow} onClick={closeMenu}><Info size={20} className="text-secondary" /> About Us</Link>
            <Link href="/contact-us" className={drawerRow} onClick={closeMenu}><Phone size={20} className="text-secondary" /> Contact Us</Link>

            {/* Product categories */}
            {(categories === null || categories.length > 0) && (
              <>
                <div className="my-2 border-t border-base-300" />
                <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wider text-base-content/50">Categories</p>
                {categories === null
                  ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="mx-3 my-2.5 h-4 animate-pulse rounded bg-base-200" />)
                  : categories.map((c) => (
                      <Link key={c._id} href={`/categories/${c.slug}`} className={categoryRow} onClick={closeMenu}>
                        <span className="min-w-0 truncate">{c.name}</span>
                        <ChevronRight size={18} className="shrink-0 text-base-content/40" />
                      </Link>
                    ))}
              </>
            )}
          </nav>

          {/* Account buttons at the bottom */}
          <div className="shrink-0 space-y-2.5 border-t border-base-300 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {user ? (
              <button className="btn btn-outline h-12 w-full gap-2 text-base" onClick={handleSignOut}><LogOut size={18} /> Sign out</button>
            ) : (
              <>
                {/* Sign in: aqua (primary colour) */}
                <Link href="/login" className="btn btn-primary h-12 w-full gap-2 text-base" onClick={closeMenu}><LogIn size={18} /> Sign in</Link>
                <Link href="/register" className="btn btn-secondary h-12 w-full gap-2 text-base" onClick={closeMenu}><UserPlus size={18} /> Register</Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}