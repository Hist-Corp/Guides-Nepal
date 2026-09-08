import { ReactNode } from "react";
import Card from "./Card";

export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-darkBlue">{title}</h3>
          {subtitle ? <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </Card>
  );
}
