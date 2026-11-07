import { Suspense } from "react";
import ProductListing from "@/components/product/ProductListing";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={null}>
      <ProductListing key={slug} categorySlug={slug} />
    </Suspense>
  );
}
