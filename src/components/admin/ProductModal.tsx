"use client";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { api, ApiError } from "@/lib/api";
import type { Category, Product, ProductImage } from "@/types";

interface Props {
  product: Product | null; // null = create
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductModal({ product, categories, onClose, onSaved }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: product?.title ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    originalPrice: product?.originalPrice ? String(product.originalPrice) : "",
    category: product?.category?._id ?? categories[0]?._id ?? "",
    brand: product?.brand ?? "",
    stock: product ? String(product.stock) : "10",
    inStock: product?.inStock ?? true,
    isFeatured: product?.isFeatured ?? false,
  });
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addUrl = () => {
    try {
      new URL(urlInput);
      setImages((i) => [...i, { url: urlInput.trim(), provider: "external" }]);
      setUrlInput("");
    } catch {
      toast.error("Enter a full image URL starting with https://");
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) return toast.error("Create a category first, then pick it here");
    const price = Number(form.price);
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : null;
    if (!Number.isFinite(price) || price < 0) return toast.error("Enter a valid price");
    if (originalPrice !== null && originalPrice < price) return toast.error("Original price must be higher than the sale price");

    setSaving(true);
    try {
      let all = images;
      if (files.length) {
        const uploaded = await api.upload(files);
        all = [...images, ...uploaded.images];
      }
      const body = {
        title: form.title.trim(),
        description: form.description,
        price,
        originalPrice,
        category: form.category,
        brand: form.brand.trim(),
        stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
        inStock: form.inStock,
        isFeatured: form.isFeatured,
        images: all,
      };
      if (product) await api.products.update(product._id, body);
      else await api.products.create(body);
      toast.success(product ? "Product updated" : "Product added");
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? (err.details?.[0] ? `${err.details[0].path}: ${err.details[0].message}` : err.message) : "Could not save the product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog className="modal modal-open" aria-labelledby="pm-title">
      <form onSubmit={save} className="modal-box max-h-[92dvh] w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 id="pm-title" className="text-xl font-bold">{product ? "Edit product" : "Add product"}</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-circle btn-sm" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Title *</span>
            <input required className="input input-bordered w-full" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium">Price (৳) *</span>
            <input required type="number" min={0} className="input input-bordered w-full" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium">Original price (৳)</span>
            <input type="number" min={0} className="input input-bordered w-full" placeholder="Shown struck-through" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium">Category *</span>
            <select required className="select select-bordered w-full" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {categories.length === 0 && <option value="">No categories yet</option>}
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium">Brand</span>
            <input className="input input-bordered w-full" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium">Stock quantity</span>
            <input type="number" min={0} className="input input-bordered w-full" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium">Stock status</span>
            <select className="select select-bordered w-full" value={form.inStock ? "in" : "out"} onChange={(e) => set("inStock", e.target.value === "in")}>
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Description</span>
            <textarea rows={3} className="textarea textarea-bordered w-full" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Featured product
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">Images</p>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={img.url} className="group relative size-20 overflow-hidden rounded-lg border border-base-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="size-full object-cover" />
                <button type="button" onClick={() => setImages((l) => l.filter((_, j) => j !== i))} aria-label="Remove image" className="absolute inset-0 grid place-items-center bg-neutral/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"><Trash2 size={18} /></button>
              </div>
            ))}
            {previews.map((src, i) => (
              <div key={src} className="group relative size-20 overflow-hidden rounded-lg border-2 border-dashed border-primary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
                <button type="button" onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} aria-label="Remove new image" className="absolute inset-0 grid place-items-center bg-neutral/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"><Trash2 size={18} /></button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()} className="grid size-20 place-items-center rounded-lg border-2 border-dashed border-base-300 text-base-content/50 hover:border-primary hover:text-primary" aria-label="Add images">
              <ImagePlus size={22} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { setFiles((l) => [...l, ...Array.from(e.target.files ?? [])].slice(0, 8)); e.target.value = ""; }} />
          </div>
          <p className="mt-2 text-xs text-base-content/55">New images upload to Cloudinary / ImageKit when you save (max 5 MB each). The first image is the main one.</p>
          <div className="mt-2 flex gap-2">
            <input className="input input-bordered input-sm flex-1" placeholder="…or paste an image URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
            <button type="button" className="btn btn-sm" onClick={addUrl} disabled={!urlInput}>Add URL</button>
          </div>
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-secondary" disabled={saving}>{saving && <Loader2 size={16} className="animate-spin" />} {product ? "Save changes" : "Add product"}</button>
        </div>
      </form>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}
