import { ReactNode } from "react"

export default function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[520px] rounded-2xl bg-surface border border-line shadow-lg">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <div className="font-semibold text-main">{title}</div>
          <button className="cursor-pointer rounded-lg px-2 py-1 border border-line text-soft transition hover:bg-surface-2 hover:text-main" onClick={onClose}>Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
