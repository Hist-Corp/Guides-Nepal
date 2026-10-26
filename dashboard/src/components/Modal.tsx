import { ReactNode } from 'react';

export default function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        className={`${wide ? 'w-[860px]' : 'w-[520px]'} max-h-[92vh] flex flex-col rounded-2xl bg-surface border border-line shadow-lg`}
      >
        <div className="px-4 py-3 border-b border-line flex items-center justify-between shrink-0">
          <div className="font-semibold text-main">{title}</div>
          <button
            className="cursor-pointer rounded-lg px-2 py-1 border border-line text-soft transition hover:bg-surface-2 hover:text-main"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
