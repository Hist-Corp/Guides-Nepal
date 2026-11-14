import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center rounded-full font-semibold transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 shadow-btn-blue",
  secondary:
    "border border-line bg-surface text-main hover:bg-surface-2 focus-visible:ring-brand-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  ghost: "text-soft hover:bg-surface-2 hover:text-main focus-visible:ring-brand-400",
  icon: "border border-line bg-surface text-main hover:bg-surface-2 focus-visible:ring-brand-400",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon ? <span className="mr-1.5 flex items-center">{icon}</span> : null}
      {children}
    </button>
  );
}
