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
        "gn-card rounded-2xl border border-line",
        padding,
        className
      )}
    >
      {children}
    </div>
  );
}
