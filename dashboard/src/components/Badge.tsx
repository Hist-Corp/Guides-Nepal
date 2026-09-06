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
  default: "bg-gray-100 text-gray-800",
  primary: "bg-primary/10 text-primary",
  success: "bg-green-100 text-green-800",
  published: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-amber-100 text-amber-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-gray-300 text-gray-700",
  info: "bg-lightBlue/60 text-darkBlue",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "text-xs",
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
