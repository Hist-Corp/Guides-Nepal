import { ReactNode } from "react";
import { cn } from "../utils/cn";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T, index?: number) => ReactNode;
};

export interface TableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  rowKey?: (row: T, index: number) => string | number;
  className?: string;
}

export default function Table<T extends Record<string, any>>({
  columns,
  rows,
  emptyMessage = "No records found.",
  rowKey,
  className,
}: TableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-line bg-surface text-main",
        className
      )}
    >
      <table className="min-w-full text-sm">
        <thead className="bg-surface-3 border-b border-line">
          <tr>
            {columns.map((c, ci) => (
              <th
                key={`${String(c.key)}-${ci}`}
                className="text-left px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-soft"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {rows.map((r, idx) => (
            <tr
              key={rowKey ? rowKey(r, idx) : idx}
              className="transition-colors hover:bg-surface-2"
            >
              {columns.map((c, ci) => (
                <td
                  key={`${String(c.key)}-${ci}`}
                  className="px-3 py-2 align-top"
                >
                  {"render" in c && c.render
                    ? (c.render as any)(r, idx)
                    : String(r[c.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <div className="py-8 text-center text-sm text-soft">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  );
}
