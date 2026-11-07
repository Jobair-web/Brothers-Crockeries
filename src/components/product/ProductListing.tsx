"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { PAGE_SIZE } from "@/lib/constants";
import { CategoryIcon } from "@/lib/categoryIcons";
import ProductGrid, { ProductGridSkeleton } from "./ProductGrid";
import PriceFilter from "./PriceFilter";
import Pagination from "./Pagination";
import type { Category, ProductListResponse } from "@/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
];

/** Shared by /products and /categories/[slug]. Mount it with key={slug} so filters reset between categories. */
export default function ProductListing({ categorySlug }: { categorySlug?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const page = Math.max(parseInt(params.get("page") ?? "1", 10) || 1, 1);
  const search = params.get("search") ?? "";
  const sort = params.get("sort") ?? "newest";

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [price, setPrice] = useState<[number, number] | null>(null); // null = full range
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedPrice = useDebounce(price, 350);

  const setParam = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  useEffect(() => {
    api.categories.list().then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api.products
      .list({
        page, limit: PAGE_SIZE, category: categorySlug, search, sort, inStock: inStockOnly || undefined,
        minPrice: debouncedPrice?.[0], maxPrice: debouncedPrice?.[1],
      })
      .then((r) => !cancelled && setData(r))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, categorySlug, search, sort, inStockOnly, debouncedPrice]);

  const bounds = data?.priceRange ?? { min: 0, max: 0 };
  const sliderValue = useMemo<[number, number]>(() => price ?? [bounds.min, bounds.max], [price, bounds.min, bounds.max]);
  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const title = categorySlug ? (activeCategory?.name ?? "Category") : search ? `Results for “${search}”` : "All products";

  const goToPage = (p: number) => {
    setParam({ page: p > 1 ? String(p) : null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const from = data && data.total ? (data.page - 1) * data.limit + 1 : 0;
  const to = data ? Math.min(data.page * data.limit, data.total) : 0;

  const sidebar = (
    <div className="space-y-4">
      <PriceFilter
        bounds={bounds}
        value={sliderValue}
        onChange={(v) => {
          setPrice(v);
          if (page > 1) setParam({ page: null });
        }}
        onReset={() => setPrice(null)}
      />
      <label className="flex cursor-pointer items-center gap-3 rounded-box border border-base-300/70 bg-base-100 p-4 text-sm">
        <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
        In stock only
      </label>
      <nav aria-label="Categories" className="rounded-box border border-base-300/70 bg-base-100 p-4">
        <h2 className="mb-2 font-semibold">Categories</h2>
        <ul className="space-y-0.5 text-sm">
          <li>
            <Link href="/products" className={`flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-base-200 ${!categorySlug ? "bg-base-200 font-semibold text-secondary" : ""}`}>
              All products
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c._id}>
              <Link
                href={`/categories/${c.slug}`}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-200 ${c.slug === categorySlug ? "bg-base-200 font-semibold text-secondary" : ""}`}
              >
                <CategoryIcon name={c.icon} size={16} />
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-base-content/45">{c.productCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-base-content/60">
        <Link href="/" className="hover:text-secondary">Home</Link> <span className="mx-1">/</span>
        {categorySlug ? (
          <>
            <Link href="/products" className="hover:text-secondary">Products</Link> <span className="mx-1">/</span>
            <span className="text-base-content">{activeCategory?.name ?? categorySlug}</span>
          </>
        ) : (
          <span className="text-base-content">Products</span>
        )}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>{sidebar}</aside>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm italic text-base-content/60" aria-live="polite">
                {loading && !data ? "Loading…" : data?.total ? `Showing ${from}–${to} of ${data.total} results` : "No products found"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-sm btn-outline lg:hidden" onClick={() => setFiltersOpen((v) => !v)}>
                <SlidersHorizontal size={15} /> Filters
              </button>
              <select
                aria-label="Sort products"
                className="select select-sm"
                value={sort}
                onChange={(e) => setParam({ sort: e.target.value === "newest" ? null : e.target.value, page: null })}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-5">
            {error ? (
              <div role="alert" className="alert alert-error alert-soft">Could not load products: {error}. Is the API running?</div>
            ) : loading && !data ? (
              <ProductGridSkeleton count={10} />
            ) : data && data.products.length === 0 ? (
              <div className="rounded-box border border-dashed border-base-300 bg-base-100 p-10 text-center">
                <p className="font-semibold">No products match these filters</p>
                <p className="mt-1 text-sm text-base-content/60">Widen the price range or clear the search.</p>
                <button className="btn btn-sm btn-primary mt-4" onClick={() => { setPrice(null); setInStockOnly(false); setParam({ search: null, page: null }); }}>Clear filters</button>
              </div>
            ) : (
              <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <ProductGrid products={data?.products ?? []} />
              </div>
            )}
          </div>

          {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={goToPage} />}
        </section>
      </div>
    </div>
  );
}
