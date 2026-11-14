import React from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: number;
  user_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

const STAR_FILL = 'fill-brand-yellow text-brand-yellow';
const STAR_EMPTY = 'text-gray-300';

export function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < review.rating ? STAR_FILL : STAR_EMPTY}`}
          />
        ))}
        <span className="text-xs text-slate-500 ml-2">{date}</span>
      </div>
      {review.comment && (
        <p className="text-slate-700 leading-relaxed">{review.comment}</p>
      )}
      <p className="text-xs text-slate-400 mt-3">
        by {review.user_name ?? 'A traveller'}
      </p>
    </div>
  );
}