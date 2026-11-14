import { ReactNode } from "react";
import { cn } from "../utils/cn";
import Card from "./Card";

export default function PageShell({
  title,
  description,
  action,
  children,
  className,
  noCard,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  noCard?: boolean;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-main">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-soft">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
      {noCard ? <>{children}</> : <Card>{children}</Card>}
    </div>
  );
}
