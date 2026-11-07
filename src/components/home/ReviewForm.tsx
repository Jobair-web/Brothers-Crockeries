"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, PenLine, Star, X } from "lucide-react";
import { toast } from "react-toastify";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

export default function ReviewForm() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  if (!session?.user) {
    return <Link href="/login?redirect=/" className="btn btn-sm btn-outline border-white/40 text-white hover:bg-white hover:text-neutral"><PenLine size={15} /> Sign in to write a review</Link>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { message } = await api.reviews.create({ name: name || session.user.name, location, rating, comment });
      toast.success(message);
      setOpen(false);
      setComment("");
    } catch (err) {
      toast.error(err instanceof ApiError ? (err.details?.[0]?.message ?? err.message) : "Could not submit your review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className="btn btn-sm btn-primary" onClick={() => { setName(session.user.name ?? ""); setOpen(true); }}><PenLine size={15} /> Write a review</button>
      {open && (
        <dialog className="modal modal-open text-base-content">
          <form onSubmit={submit} className="modal-box max-w-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Share your experience</h3>
              <button type="button" className="btn btn-ghost btn-circle btn-sm" aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}>
                    <Star size={26} className={n <= rating ? "fill-warning text-warning" : "text-base-300"} />
                  </button>
                ))}
              </div>
              <input required className="input input-bordered w-full" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="input input-bordered w-full" placeholder="Area / city (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
              <textarea required minLength={5} maxLength={600} rows={4} className="textarea textarea-bordered w-full" placeholder="What did you buy and how was it?" value={comment} onChange={(e) => setComment(e.target.value)} />
              <p className="text-xs text-base-content/55">Reviews appear on the home page after the shop approves them.</p>
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-secondary" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Submit review</button>
            </div>
          </form>
          <div className="modal-backdrop" onClick={() => setOpen(false)} />
        </dialog>
      )}
    </>
  );
}
