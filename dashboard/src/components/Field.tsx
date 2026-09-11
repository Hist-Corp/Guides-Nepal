import { ReactNode } from "react";
import { cn } from "../utils/cn";

export default function Field({
  label,
  error,
  as = "input",
  className,
  children,
  ...props
}: {
  label?: string;
  error?: string;
  as?: "input" | "textarea" | "select";
  className?: string;
  children?: ReactNode;
} & Record<string, any>) {
  const inputCls = cn(
    "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-main placeholder:text-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:bg-surface-3",
    className
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="text-sm font-medium text-main">{label}</label>
      ) : null}
      {as === "textarea" ? (
        <textarea className={inputCls} {...props} />
      ) : as === "select" ? (
        <select className={inputCls} {...props}>
          {children}
        </select>
      ) : (
        <input className={inputCls} {...props} />
      )}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
