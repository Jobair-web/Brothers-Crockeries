"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import ProductGrid, { ProductGridSkeleton } from "@/components/product/ProductGrid";
import Pagination from "@/components/product/Pagination";
import type { ProductListResponse } from "@/types";

const PER_PAGE = 20;
// Desktop: 5 per row (20 products = 4 rows). Mobile: 2 per row (10 rows).
const HOME_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5";

/**
 * Homepage "All Products", 20 per page, paged by the server.
 * Featured products are sorted to the very end, so they do not repeat on the first page
 * (they still appear here, on the last page(s)).
 */
export default function PopularProducts() {
  const sectionRef = useRef<HTMLElement>(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api.products
      .list({ page, limit: PER_PAGE, featuredLast: true })
      .then((r) => {
        if (cancelled) return;
        // a page past the end (e.g. products were deleted): jump to the last page
        if (r.products.length === 0 && r.totalPages > 0 && page > r.totalPages) {
          setPage(r.totalPages);
          return;
        }
        setData(r);
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  const goToPage = (p: number) => {
    setPage(p);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const from = data && data.total ? (data.page - 1) * data.limit + 1 : 0;
  const to = data ? Math.min(data.page * data.limit, data.total) : 0;

  return (
    <section ref={sectionRef} className="mx-auto mt-10 max-w-350 scroll-mt-28 px-4 sm:mt-12" aria-labelledby="all-products">
      <div className="mb-4">
        <h2 id="all-products" className="text-2xl font-bold">All Products</h2>
        {data && data.total > 0 && (
          <p className="mt-1 text-sm text-base-content/60" aria-live="polite">
            Showing {from}–{to} of {data.total} products
          </p>
        )}
      </div>

      {error ? (
        <div role="alert" className="alert alert-error alert-soft flex-wrap justify-between">
          <span>Could not load products: {error}. Check that the API server is running.</span>
          <button className="btn btn-sm" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
        </div>
      ) : !data ? (
        <ProductGridSkeleton count={PER_PAGE} className={HOME_GRID} />
      ) : data.products.length === 0 ? (
        <p className="rounded-box border border-dashed border-base-300 bg-base-100 p-8 text-center text-sm text-base-content/60">
          No products yet. Add some from the Admin panel, or run <code>npm run seed</code> in the server folder.
        </p>
      ) : (
        <>
          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <ProductGrid products={data.products} className={HOME_GRID} />
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={goToPage} />
        </>
      )}
    </section>
  );
}