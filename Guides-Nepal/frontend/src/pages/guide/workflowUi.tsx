import React from 'react';

/** Shared status badge styling for the experience-workflow guide pages. */
const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  changes_requested: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-emerald-100 text-emerald-800',
  applied: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-gray-200 text-gray-500',
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700'}`}
  >
    {status.replace('_', ' ')}
  </span>
);
