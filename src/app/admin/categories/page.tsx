"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import type { Category } from "@/types";

const blank = { name: "", slug: "", image: "", isFeatured: true, order: "0" };

export default function AdminCategoriesPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

  const load = useCallback(
    () => api.categories.list().then((r) => setCategories(r.categories)).catch((e: Error) => toast.error(e.message)),
    []
  );
  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setImage = (url: string) => {
    setImgBroken(false);
    set("image", url);
  };
  const reset = () => {
    setForm({ ...blank, order: String(categories.length) });
    setImgBroken(false);
    setEditingId(null);
  };

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { images } = await api.upload([file]);
      setImage(images[0].url);
      toast.success("Image uploaded. Press Save to keep it.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const body = {
      name: form.name.trim(),
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      image: form.image.trim(),
      isFeatured: form.isFeatured,
      order: Number(form.order) || 0,
    };
    try {
      if (editingId) await api.categories.update(editingId, body);
      else await api.categories.create(body);
      toast.success(editingId ? "Category updated" : "Category added");
      reset();
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: Category) => {
    if (!window.confirm(`Delete “${c.name}”?`)) return;
    try {
      await api.categories.remove(c._id);
      toast.success("Category deleted");
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const edit = (c: Category) => {
    setEditingId(c._id);
    setImgBroken(false);
    setForm({
      name: c.name,
      slug: c.slug,
      image: c.image ?? "",
      isFeatured: c.isFeatured !== false,
      order: String(c.order ?? 0),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="mt-1 text-sm text-base-content/60">
        The home page shows the first 10 categories marked “Show on the home page”, sorted by Order (smallest first). Each one shows its image with the name under it.
      </p>

      <form onSubmit={save} className="mt-4 grid gap-5 rounded-box bg-base-100 p-5 lg:grid-cols-[1fr_260px]">
        <div className="grid content-start gap-3 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">{editingId ? "Edit category" : "New category"}</h2>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Name *</span>
            <input required className="input input-bordered w-full" placeholder="e.g. Crockeries" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Image URL (paste your ImageKit link)</span>
            <input
              type="url"
              className="input input-bordered w-full"
              placeholder="https://ik.imagekit.io/your_id/crockeries.jpg"
              value={form.image}
              onChange={(e) => setImage(e.target.value)}
            />
            <span className="mt-1 block text-xs text-base-content/50">
              Best size 4:3 (e.g. 800 × 600). Adding <code>?tr=w-800</code> to the end of an ImageKit link makes it load faster.
            </span>
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Slug (the web address, optional)</span>
            <input className="input input-bordered w-full" placeholder="e.g. crockeries" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            <span className="mt-1 block text-xs text-base-content/50">Leave empty to create it from the name. English letters, numbers and dashes only.</span>
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium">Order</span>
            <input type="number" className="input input-bordered w-full" value={form.order} onChange={(e) => set("order", e.target.value)} />
          </label>
          <label className="flex cursor-pointer items-center gap-2 self-end pb-3 text-sm">
            <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
            Show on the home page
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <button className="btn btn-secondary" disabled={busy || uploading}>
              {busy && <Loader2 size={16} className="animate-spin" />} {editingId ? "Save changes" : "Add category"}
            </button>
            {editingId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
          </div>
        </div>

        {/* Live preview */}
        <div>
          <span className="mb-1 block text-sm font-medium">Preview</span>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-dashed border-base-300 bg-base-200">
            {form.image && !imgBroken ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt="" className="size-full object-cover" onError={() => setImgBroken(true)} />
                <button type="button" onClick={() => setImage("")} aria-label="Remove image" className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-neutral/80 text-white">
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="grid size-full place-items-center px-3 text-center text-xs text-base-content/50">
                {imgBroken ? "This link did not load as an image. Check the URL." : "The image appears here after you paste a link."}
              </div>
            )}
          </div>
          <div className="mt-2 rounded-lg bg-base-200 px-3 py-2 text-center text-sm font-bold text-secondary">{form.name || "Category name"}</div>

          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-xs btn-outline mt-3 w-full" disabled={uploading}>
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />} Or upload from this computer
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
          <p className="mt-1 text-[11px] text-base-content/45">Upload needs Cloudinary or ImageKit keys in server/.env. Pasting a link needs nothing.</p>
        </div>
      </form>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {categories.map((c) => (
          <li key={c._id} className="overflow-hidden rounded-box bg-base-100">
            <div className="relative aspect-[4/3] bg-base-200">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt="" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-xs font-medium text-warning-content/80">
                  <span className="rounded bg-warning px-2 py-1">No image yet</span>
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-1 text-xs text-base-content/50">
                /{c.slug} · Order {c.order ?? 0} · {c.productCount ?? 0} products{c.isFeatured === false && " · hidden"}
              </p>
              <div className="mt-2 flex gap-1">
                <button className="btn btn-ghost btn-sm btn-square" aria-label={`Edit ${c.name}`} onClick={() => edit(c)}><Pencil size={16} /></button>
                <button className="btn btn-ghost btn-sm btn-square text-error" aria-label={`Delete ${c.name}`} onClick={() => remove(c)}><Trash2 size={16} /></button>
              </div>
            </div>
          </li>
        ))}
        {categories.length === 0 && <li className="rounded-box bg-base-100 p-8 text-center text-base-content/55 sm:col-span-2 lg:col-span-3 xl:col-span-5">No categories yet. Add your first one above.</li>}
      </ul>
    </div>
  );
}