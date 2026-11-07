import ProductCard from "./ProductCard";
import type { Product } from "@/types";

export const PRODUCT_GRID_CLASSES = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";

export function ProductGridSkeleton({ count = 10, className = PRODUCT_GRID_CLASSES }: { count?: number; className?: string }) {
  return (
    <div className={className} aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-box border border-base-300/70 bg-base-100">
          <div className="aspect-square animate-pulse bg-base-200" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-base-200" />
            <div className="h-4 animate-pulse rounded bg-base-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-base-200" />
            <div className="h-8 animate-pulse rounded bg-base-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid({ products, className = PRODUCT_GRID_CLASSES }: { products: Product[]; className?: string }) {
  return (
    <div className={className}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}