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
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-darkBlue placeholder-gray-400 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 disabled:cursor-not-allowed disabled:bg-gray-100",
    className
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="text-sm font-medium text-gray-700">{label}</label>
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
