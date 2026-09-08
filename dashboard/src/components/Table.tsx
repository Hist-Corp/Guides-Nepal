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
        "overflow-x-auto rounded-lg border border-gray-200 bg-white",
        className
      )}
    >
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((c, ci) => (
              <th
                key={`${String(c.key)}-${ci}`}
                className="text-left px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, idx) => (
            <tr
              key={rowKey ? rowKey(r, idx) : idx}
              className="hover:bg-gray-50"
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
        <div className="py-8 text-center text-sm text-gray-500">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  );
}
