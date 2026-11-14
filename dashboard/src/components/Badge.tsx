import { ReactNode } from "react";
import { cn } from "../utils/cn";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "published"
  | "danger"
  | "warning"
  | "draft"
  | "archived"
  | "info";

export type BadgeSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
  primary: "bg-darkBlue/10 text-darkBlue ring-1 ring-inset ring-darkBlue/20 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/40",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  published: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  danger: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  draft: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  archived: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
  info: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-sm",
};

export default function Badge({
  children,
  text,
  variant = "default",
  size = "md",
  color,
}: {
  children?: ReactNode;
  text?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: string;
}) {
  const content = children ?? text;
  const variantClass = color ?? VARIANT_CLASSES[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
        SIZE_CLASSES[size],
        variantClass
      )}
    >
      {content}
    </span>
  );
}
