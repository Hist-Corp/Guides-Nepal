import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export type InlineMessageType = 'ok' | 'error';

/** Small green/red inline status banner used by the account settings forms. */
const InlineMessage: React.FC<{ type: InlineMessageType; text: string }> = ({ type, text }) => (
  <div
    className={`mb-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
      type === 'ok'
        ? 'bg-green-50 border border-green-200 text-green-700'
        : 'bg-red-50 border border-red-200 text-red-700'
    }`}
  >
    {type === 'ok' ? (
      <Check className="w-4 h-4 mt-0.5 shrink-0" />
    ) : (
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
    )}
    <span className="min-w-0 break-words">{text}</span>
  </div>
);

export default InlineMessage;
