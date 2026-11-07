"use client";
import { useCallback, useEffect, useState } from "react";
import { Check, EyeOff, Star, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setReviews((await api.reviews.listAll()).reviews);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const setApproval = async (r: Review, isApproved: boolean) => {
    try {
      await api.reviews.setApproval(r._id, isApproved);
      setReviews((l) => l.map((x) => (x._id === r._id ? { ...x, isApproved } : x)));
      toast.success(isApproved ? "Review published" : "Review hidden");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (r: Review) => {
    if (!window.confirm(`Delete the review by ${r.name}?`)) return;
    try {
      await api.reviews.remove(r._id);
      setReviews((l) => l.filter((x) => x._id !== r._id));
      toast.success("Review deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const pending = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">Reviews</h1>
      <p className="mt-1 text-sm text-base-content/60">
        {pending > 0 ? `${pending} waiting for approval. ` : ""}The home page shows approved reviews once there are 6 or more; until then it shows sample text.
      </p>

      <ul className="mt-5 space-y-3">
        {reviews.map((r) => (
          <li key={r._id} className="rounded-box bg-base-100 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{r.name} <span className="font-normal text-base-content/55">{r.location && `· ${r.location}`}</span></p>
                <p className="mt-0.5 flex items-center gap-0.5" aria-label={`${r.rating} out of 5`}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < r.rating ? "fill-warning text-warning" : "text-base-300"} />)}
                  {r.createdAt && <span className="ml-2 text-xs text-base-content/50">{formatDate(r.createdAt)}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge badge-sm badge-soft ${r.isApproved ? "badge-success" : "badge-warning"}`}>{r.isApproved ? "Published" : "Pending"}</span>
                {r.isApproved ? (
                  <button className="btn btn-ghost btn-xs gap-1" onClick={() => setApproval(r, false)}><EyeOff size={14} /> Hide</button>
                ) : (
                  <button className="btn btn-success btn-xs gap-1" onClick={() => setApproval(r, true)}><Check size={14} /> Approve</button>
                )}
                <button className="btn btn-ghost btn-xs btn-square text-error" aria-label={`Delete review by ${r.name}`} onClick={() => remove(r)}><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{r.comment}</p>
          </li>
        ))}
        {!loading && reviews.length === 0 && <li className="rounded-box bg-base-100 p-10 text-center text-base-content/55">No reviews submitted yet.</li>}
      </ul>
    </div>
  );
}
