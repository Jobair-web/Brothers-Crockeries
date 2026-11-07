import { Suspense } from "react";
import type { Metadata } from "next";
import ProductListing from "@/components/product/ProductListing";

export const metadata: Metadata = { title: "All products" };

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductListing />
    </Suspense>
  );
}
