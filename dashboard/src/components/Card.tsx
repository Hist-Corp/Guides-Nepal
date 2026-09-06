import { ReactNode } from "react";
import { cn } from "../utils/cn";

export default function Card({
  children,
  className,
  padding = "p-5",
}: {
  children?: ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-gray-200 shadow-sm",
        padding,
        className
      )}
    >
      {children}
    </div>
  );
}
