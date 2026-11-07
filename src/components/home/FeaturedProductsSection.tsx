"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProductGrid, { ProductGridSkeleton } from "@/components/product/ProductGrid";
import type { Product } from "@/types";

const FEATURED_COUNT = 20;
// Desktop: 5 per row (20 products = 4 rows). Mobile: 2 per row (10 rows).
const HOME_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5";

/** Homepage "Featured Products": the first 20 products marked "Featured product" in the Admin panel. Hidden when there are none. */
export default function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError("");
    api.products
      .list({ featured: true, limit: FEATURED_COUNT, sort: "newest" })
      .then((r) => !cancelled && setProducts(r.products))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // No featured products: show nothing instead of an empty heading
  if (!error && products && products.length === 0) return null;

  return (
    <section className="mx-auto mt-10 max-w-350 px-4 sm:mt-12" aria-labelledby="featured-products">
      <div className="mb-4">
        <h2 id="featured-products" className="text-2xl font-bold">Featured Products</h2>
        <p className="text-sm text-base-content/60">Hand-picked for you</p>
      </div>

      {error ? (
        <div role="alert" className="alert alert-error alert-soft flex-wrap justify-between">
          <span>Could not load featured products: {error}</span>
          <button className="btn btn-sm" onClick={() => { setProducts(null); setReloadKey((k) => k + 1); }}>Try again</button>
        </div>
      ) : products === null ? (
        <ProductGridSkeleton count={FEATURED_COUNT} className={HOME_GRID} />
      ) : (
        <ProductGrid products={products} className={HOME_GRID} />
      )}
    </section>
  );
}