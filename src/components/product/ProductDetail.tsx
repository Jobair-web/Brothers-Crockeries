"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/format";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useWishlistActions } from "@/hooks/useWishlist";
import { useHydrated } from "@/hooks/useHydrated";
import type { Product } from "@/types";

export default function ProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const add = useCartStore((s) => s.add);
  const { toggle } = useWishlistActions();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const wished = useWishlistStore((s) => (product ? s.items.some((i) => i._id === product._id) : false));

  useEffect(() => {
    api.products.get(slug).then((r) => setProduct(r.product)).catch((e: Error) => setError(e.message));
  }, [slug]);

  if (error) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><p className="text-lg font-semibold">Product not found</p><p className="text-sm text-base-content/60">{error}</p><Link href="/products" className="btn btn-primary btn-sm mt-4">Back to products</Link></div>;
  if (!product) return <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-10 md:grid-cols-2"><div className="aspect-square animate-pulse rounded-box bg-base-300" /><div className="space-y-4"><div className="h-8 animate-pulse rounded bg-base-300" /><div className="h-6 w-1/3 animate-pulse rounded bg-base-300" /></div></div>;

  const soldOut = !product.inStock || product.stock <= 0;
  const images = product.images.length ? product.images : [{ url: PLACEHOLDER_IMAGE }];
  const max = Math.max(product.stock, 1);

  const buyNow = () => {
    add(product, qty);
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-base-content/60">
        <Link href="/" className="hover:text-secondary">Home</Link> / {product.category && <><Link href={`/categories/${product.category.slug}`} className="hover:text-secondary">{product.category.name}</Link> / </>}
        <span className="text-base-content">{product.title}</span>
      </nav>

      <div className="grid gap-8 rounded-box bg-base-100 p-4 sm:p-6 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-box bg-base-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[active]?.url} alt={product.title} className="size-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={img.url} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`} className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? "border-primary" : "border-transparent"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold leading-snug">{product.title}</h1>
          {product.brand && <p className="mt-1 text-sm text-base-content/60">Brand: {product.brand}</p>}

          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-accent">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-base text-base-content/45 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="rounded-md bg-accent/10 px-2 py-0.5 text-sm font-semibold text-accent">Save {product.discountPercent}%</span>
              </>
            )}
          </p>

          <p className={`mt-3 text-sm font-medium ${soldOut ? "text-error" : "text-success"}`}>
            {soldOut ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
          </p>

          {product.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-base-content/80">{product.description}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="join border border-base-300">
              <button className="btn btn-ghost join-item" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={soldOut}><Minus size={16} /></button>
              <span className="join-item grid w-12 place-items-center font-semibold">{qty}</span>
              <button className="btn btn-ghost join-item" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={soldOut || qty >= max}><Plus size={16} /></button>
            </div>
            <button className="btn btn-secondary gap-2" onClick={() => add(product, qty)} disabled={soldOut}><ShoppingCart size={18} /> Add to cart</button>
            <button className="btn btn-accent gap-2" onClick={buyNow} disabled={soldOut}><Zap size={18} /> Buy now</button>
            <button className="btn btn-outline btn-circle" aria-label="Toggle wishlist" onClick={() => toggle(product)}>
              <Heart size={18} className={hydrated && wished ? "fill-accent text-accent" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
