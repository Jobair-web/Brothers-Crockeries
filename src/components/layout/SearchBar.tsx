"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import type { Product } from "@/types";

export default function SearchBar({ onNavigate, inDrawer = false }: { onNavigate?: () => void; inDrawer?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlSearch = params.get("search") ?? "";
  const onProductsPage = pathname === "/products";

  // true on desktop (1024px and wider), false on phones and tablets
  const isDesktop = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false
  );

  const [query, setQuery] = useState(urlSearch);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // true only for the search bar the user is actually typing in (the navbar renders several copies)
  const typingRef = useRef(false);
  const debounced = useDebounce(query.trim(), 400);

  /** Updates ?search= without a Next.js navigation (no re-compile, no server round trip). */
  const writeSearchToUrl = (value: string) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set("search", value);
    else next.delete("search");
    next.delete("page");
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `/products?${qs}` : "/products");
  };

  // Keep the box in sync when the URL changes from somewhere else (back button, "Clear filters"...)
  useEffect(() => {
    if (!typingRef.current) setQuery(urlSearch);
  }, [urlSearch]);

  // Suggestions dropdown (not needed on /products, where the grid itself filters live)
  useEffect(() => {
    if (onProductsPage || debounced.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.products
      .list({ search: debounced, limit: 6 })
      .then((r) => !cancelled && setResults(r.products))
      .catch(() => !cancelled && setResults([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced, onProductsPage]);

  // Live filtering on /products: write once, only after typing has paused
  useEffect(() => {
    if (!typingRef.current || !onProductsPage) return;
    if (debounced !== query.trim()) return; // still typing
    if (debounced === urlSearch) return; // nothing to change
    writeSearchToUrl(debounced);
  }, [debounced, query, onProductsPage, urlSearch]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    onNavigate?.();
    if (onProductsPage) writeSearchToUrl(q);
    else router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  const showPanel = open && !onProductsPage && debounced.length >= 2;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={submit} role="search" className={`flex h-10 overflow-hidden rounded-lg bg-white text-base-content ring-primary/60 focus-within:ring-2 ${inDrawer ? "border border-base-300" : ""}`}>
        <input
          value={query}
          onChange={(e) => {
            typingRef.current = true;
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            typingRef.current = false;
          }}
          placeholder={isDesktop ? "Search rice cooker, blender, water filter…" : "Search products"}
          aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-base-content/45"
        />
        <button type="submit" aria-label="Search" className="grid w-11 place-items-center bg-primary text-primary-content transition-colors hover:brightness-95">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </form>

      {showPanel && (
        <div className={`absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-box bg-base-100 text-base-content shadow-2xl ${inDrawer ? "border border-base-300" : "max-lg:fixed max-lg:inset-x-3 max-lg:top-[68px]"}`}>
          {results.length === 0 && !loading ? (
            <p className="px-4 py-5 text-sm text-base-content/60">No products match “{debounced}”. Try a shorter word.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-base-200 overflow-y-auto">
              {results.map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/products/${p.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-base-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images?.[0]?.url ?? PLACEHOLDER_IMAGE} alt="" className="size-11 rounded-md object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-medium">{p.title}</span>
                      <span className="text-xs text-base-content/60">{p.category?.name}</span>
                    </span>
                    <span className="text-sm font-semibold text-secondary">{formatPrice(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {results.length > 0 && (
            <button onClick={submit} className="w-full border-t border-base-200 px-4 py-2.5 text-left text-sm font-medium text-secondary hover:bg-base-200">
              See all results for “{debounced}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}