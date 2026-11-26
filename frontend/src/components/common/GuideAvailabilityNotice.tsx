import React from 'react';
import type { GuideAvailabilityStatus } from '../../utils/guides';

interface GuideAvailabilityNoticeProps {
  status: GuideAvailabilityStatus;
  /** Re-runs a failed availability check. */
  onRetry: () => void;
  /** Copy for a confirmed empty date; defaults to the guide wording. */
  emptyMessage?: string;
  className?: string;
}

/**
 * Stands in for the guide cards whenever the list is empty.
 *
 * A check that could not be completed is not the same answer as a date with no
 * open guides, so it offers a retry instead of claiming nobody is open. No
 * cards are rendered in any of these states, so an unverified guide is never
 * offered for booking.
 */
export const GuideAvailabilityNotice: React.FC<GuideAvailabilityNoticeProps> = ({
  status,
  onRetry,
  emptyMessage = 'No guide is open for that date yet — new dates open up regularly.',
  className = 'text-sm text-gray-500',
}) => {
  if (status === 'checking') {
    return <p className={className}>Checking which guides are open…</p>;
  }
  if (status === 'failed') {
    return (
      <p className={className}>
        We couldn’t check guide availability for that date.{' '}
        <button
          type="button"
          onClick={onRetry}
          className="font-bold underline underline-offset-2 hover:text-gray-900"
        >
          Try again
        </button>
      </p>
    );
  }
  if (status === 'verified') {
    return <p className={className}>{emptyMessage}</p>;
  }
  return (
    <p className={className}>All guides for this experience are currently booked.</p>
  );
};

export default GuideAvailabilityNotice;
