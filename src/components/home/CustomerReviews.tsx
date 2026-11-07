"use client";
import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { api } from "@/lib/api";
import { SAMPLE_REVIEWS } from "@/lib/sampleReviews";
import ReviewForm from "./ReviewForm";
import type { Review } from "@/types";

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="mr-6 flex w-[320px] shrink-0 flex-col rounded-box border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm sm:w-[380px]">
      <Quote size={26} className="text-primary" aria-hidden />
      <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-white/90">{review.comment}</blockquote>
      <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <div>
          <p className="font-semibold text-white">{review.name}</p>
          {review.location && <p className="text-xs text-white/60">{review.location}</p>}
        </div>
        <div className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={i < review.rating ? "fill-warning text-warning" : "text-white/25"} />
          ))}
        </div>
      </figcaption>
    </figure>
  );
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);

  useEffect(() => {
    api.reviews.list().then((r) => r.reviews.length >= 6 && setReviews(r.reviews.slice(0, 12))).catch(() => {});
  }, []);

  return (
    <section className="mt-14 bg-neutral py-12" aria-labelledby="reviews-title">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-3 px-4">
        <div>
          <h2 id="reviews-title" className="text-2xl font-bold text-white">What our customers say</h2>
          <p className="mt-1 text-sm text-white/65">Hover over a review to pause it.</p>
        </div>
        <ReviewForm />
      </div>
      <div className="marquee mt-8 overflow-hidden">
        <div className="marquee-track">
          {[...reviews, ...reviews].map((r, i) => (
            <div key={`${r._id}-${i}`} aria-hidden={i >= reviews.length} className="flex">
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
