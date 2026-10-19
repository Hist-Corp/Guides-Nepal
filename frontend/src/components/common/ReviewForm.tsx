import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { getApiUrl } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from './Button';

const STAR_FILL = 'fill-brand-yellow text-brand-yellow';
const STAR_EMPTY = 'text-gray-300';

interface ReviewFormProps {
  experienceId: number;
  /** Fired with the saved review when submission succeeds. */
  onReviewSaved: (review: { rating: number; comment: string | null }) => void;
}

export function ReviewForm({ experienceId, onReviewSaved }: ReviewFormProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a rating.');
      return;
    }
    if (!accessToken) {
      setError('Please log in to leave a review.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('/reviews/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          experience_id: experienceId,
          rating,
          comment: comment || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(data.detail || 'Could not save your review.');
      }
      const saved = await res.json();
      setSubmitted(true);
      onReviewSaved({ rating: saved.rating, comment: saved.comment });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
        <p className="text-green-800 font-medium mb-1">Thank you for reviewing!</p>
        <p className="text-sm text-green-600">Your review has been posted.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Your rating
        </label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[5, 4, 3, 2, 1].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} stars`}
              aria-checked={rating === value}
              className={`w-8 h-8 rounded-full transition-colors ${
                rating >= value ? STAR_FILL : STAR_EMPTY
              }`}
            >
              <Star className="w-full h-full" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Your experience
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-200 p-3 text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          placeholder="What did you enjoy most?..."
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={submitting || !rating || !accessToken}
      >
        {submitting ? 'Posting…' : 'Post review'}
      </Button>
      {!accessToken && (
        <p className="text-xs text-slate-500 text-center mt-2">
          Log in to share your review.
        </p>
      )}
    </form>
  );
}