"use client";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { formatPrice, PLACEHOLDER_IMAGE } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import ProductModal from "@/components/admin/ProductModal";
import type { Category, Product, ProductListResponse } from "@/types";

const LIMIT = 12;

export default function AdminProductsPage() {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined); // undefined = closed, null = new
  const debounced = useDebounce(search, 350);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.products.list({ page, limit: LIMIT, search: debounced }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.categories.list().then((r) => setCategories(r.categories)).catch(() => {}); }, []);
  useEffect(() => setPage(1), [debounced]);

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    try {
      await api.products.remove(p._id);
      toast.success("Product deleted");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <button className="btn btn-secondary btn-sm gap-1.5" onClick={() => setEditing(null)}><Plus size={16} /> Add product</button>
      </div>

      <label className="input input-bordered mt-4 flex w-full max-w-sm items-center gap-2">
        <Search size={16} className="text-base-content/50" />
        <input className="grow" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
      </label>

      <div className="mt-4 overflow-x-auto rounded-box bg-base-100">
        <table className="table">
          <thead><tr><th colSpan={2}>Product</th><th>Category</th><th>Price</th><th>Stock</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {data?.products.map((p) => (
              <tr key={p._id} className={loading ? "opacity-60" : ""}>
                <td className="w-16">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.images[0]?.url ?? PLACEHOLDER_IMAGE} alt="" className="size-12 rounded-lg object-cover" /></td>
                <td className="max-w-xs"><p className="line-clamp-2 font-medium">{p.title}</p></td>
                <td className="text-sm">{p.category?.name ?? "—"}</td>
                <td>
                  <span className="font-semibold">{formatPrice(p.price)}</span>
                  {p.originalPrice && p.originalPrice > p.price && <span className="ml-1.5 text-xs text-base-content/45 line-through">{formatPrice(p.originalPrice)}</span>}
                </td>
                <td>{p.inStock && p.stock > 0 ? <span className="badge badge-success badge-soft badge-sm">{p.stock} in stock</span> : <span className="badge badge-error badge-soft badge-sm">Out of stock</span>}</td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button className="btn btn-ghost btn-sm btn-square" aria-label={`Edit ${p.title}`} onClick={() => setEditing(p)}><Pencil size={16} /></button>
                    <button className="btn btn-ghost btn-sm btn-square text-error" aria-label={`Delete ${p.title}`} onClick={() => remove(p)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {data && data.products.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-base-content/55">No products found.</td></tr>}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-base-content/60">Page {data.page} of {data.totalPages} · {data.total} products</span>
          <div className="join">
            <button className="btn btn-sm join-item" disabled={!data.hasPrev} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <button className="btn btn-sm btn-primary join-item" disabled={!data.hasNext} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {editing !== undefined && (
        <ProductModal
          key={editing?._id ?? "new"}
          product={editing}
          categories={categories}
          onClose={() => setEditing(undefined)}
          onSaved={() => { setEditing(undefined); load(); }}
        />
      )}
    </div>
  );
}
