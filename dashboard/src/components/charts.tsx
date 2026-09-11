import { useTheme } from "../hooks/useTheme";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/*
 * Visual analytics toolkit — ported from the reference design's chart
 * language (BLUE primary, tangerine secondary, gradient fills, rounded
 * bars, soft tooltips) and made theme-aware for light/dark consoles.
 */

const BRAND = "#2563eb";
const ACCENT = "#ff8a5c";
const MINT = "#34d399";
const SKY = "#38bdf8";
const FLAME = "#f472b6";

export const CHART_COLORS = [BRAND, ACCENT, MINT, "#1e40af", FLAME, SKY];

const usdFmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

/** Theme-aware axis/grid/tooltip tokens. */
function useChartTheme() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    dark,
    axis: { stroke: dark ? "#64748b" : "#94a3b8", fontSize: 11 },
    grid: { stroke: dark ? "rgba(148,163,184,0.14)" : "#e2e8f0", strokeDasharray: "3 3" },
    tooltip: {
      contentStyle: {
        borderRadius: 12,
        border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
        boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
        fontSize: 12,
        background: dark ? "#1e293b" : "#ffffff",
        color: dark ? "#f1f5f9" : "#0f172a",
      },
      labelStyle: { color: dark ? "#f1f5f9" : "#0f172a", fontWeight: 600 },
      itemStyle: { color: dark ? "#cbd5e1" : "#334155" },
      cursor: { fill: dark ? "rgba(148,163,184,0.08)" : "rgba(37,99,235,0.06)" },
    },
  };
}

/* ------------------------------------------------------------------
   Platform growth — multi-series gradient area chart
   (bookings · users · tours across weeks)
   ------------------------------------------------------------------ */
export function GrowthAreaChart({
  data,
  series,
  height = 260,
}: {
  data: Array<Record<string, any>>;
  series: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  const t = useChartTheme();
  const colors = series.map((s, i) => s.color ?? CHART_COLORS[i % CHART_COLORS.length]);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          {colors.map((c, i) => (
            <linearGradient key={i} id={`gArea${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity={0.35} />
              <stop offset="100%" stopColor={c} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...t.grid} vertical={false} />
        <XAxis dataKey={Object.keys(data[0] ?? { k: 1 })[0]} tick={t.axis} axisLine={false} tickLine={false} />
        <YAxis tick={t.axis} axisLine={false} tickLine={false} />
        <Tooltip {...(t.tooltip as any)} />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={colors[i]}
            strokeWidth={2.5}
            fill={`url(#gArea${i})`}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------
   Weekly bars — rounded BLUE bars with hover tooltip
   ------------------------------------------------------------------ */
export function WeeklyBarChart({
  data,
  dataKey = "value",
  name = "Bookings",
  color = BRAND,
  height = 240,
  valueFormatter,
}: {
  data: Array<Record<string, any>>;
  dataKey?: string;
  name?: string;
  color?: string;
  height?: number;
  valueFormatter?: (v: number) => string;
}) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid {...t.grid} vertical={false} />
        <XAxis dataKey={Object.keys(data[0] ?? { k: 1 })[0]} tick={t.axis} axisLine={false} tickLine={false} />
        <YAxis tick={t.axis} axisLine={false} tickLine={false} />
        <Tooltip
          {...(t.tooltip as any)}
          formatter={valueFormatter ? (v: any) => valueFormatter(v as number) : undefined}
          cursor={t.tooltip.cursor}
        />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[6, 6, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------
   Donut with % legend — traffic sources, ticket mix
   ------------------------------------------------------------------ */
export function DonutChartCard({
  segments,
  height = 210,
}: {
  segments: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const t = useChartTheme();
  const data = segments.map((s, i) => ({ ...s, color: s.color ?? CHART_COLORS[i % CHART_COLORS.length] }));
  const total = data.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Fixed-size wrapper so the donut slices are never clipped */}
      <div className="w-full" style={{ maxWidth: 220 }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={52} outerRadius={76} paddingAngle={3} stroke="none">
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              {...(t.tooltip as any)}
              formatter={(v: any, n: any) => [`${v} (${Math.round((Number(v) / total) * 100)}%)`, n]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full max-w-[220px] space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5 text-xs">
            <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="truncate font-semibold text-main">{d.label}</span>
            <span className="ml-auto tabular-nums text-soft">
              {d.value} · {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------
   Earnings line — single line with dots and $ tooltip
   ------------------------------------------------------------------ */
export function EarningsLineChart({
  data,
  dataKey = "value",
  name = "Net earnings",
  color = BRAND,
  height = 220,
  currency = true,
}: {
  data: Array<Record<string, any>>;
  dataKey?: string;
  name?: string;
  color?: string;
  height?: number;
  currency?: boolean;
}) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid {...t.grid} vertical={false} />
        <XAxis dataKey={Object.keys(data[0] ?? { k: 1 })[0]} tick={t.axis} axisLine={false} tickLine={false} />
        <YAxis
          tick={t.axis}
          axisLine={false}
          tickLine={false}
          tickFormatter={currency ? (v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}` : undefined}
        />
        <Tooltip {...(t.tooltip as any)} formatter={currency ? (v: any) => usdFmt(v as number) : undefined} />
        <Line type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------
   Booking heatmap — weekday × time-slot intensity grid
   ------------------------------------------------------------------ */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function BookingHeatmap({
  matrix,
  slots,
  days = DAYS,
  color = BRAND,
}: {
  matrix: number[][];
  slots: string[];
  days?: string[];
  color?: string;
}) {
  const { dark } = useChartTheme();
  const flat = matrix.flat();
  const max = Math.max(...flat, 1);
  const rgb = hexToRgbTriplet(color);
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex flex-col justify-between py-[2px]">
          {days.map((d) => (
            <span key={d} className="h-8 text-[10px] font-semibold leading-8 text-soft">
              {d}
            </span>
          ))}
        </div>
        <div className="flex-1 space-y-[2px]">
          {matrix.map((row, ri) => (
            <div key={ri} className="flex gap-[2px]">
              {row.map((v, ci) => {
                const intensity = v / max;
                return (
                  <div
                    key={ci}
                    title={`${days[ri]} · ${slots[ci]} — ${v} bookings`}
                    className="h-8 flex-1 cursor-pointer rounded-[4px] transition-transform hover:scale-[1.05]"
                    style={{
                      background:
                        intensity > 0.02
                          ? `rgba(${rgb} / ${0.08 + intensity * 0.85})`
                          : dark
                            ? "rgba(148,163,184,0.07)"
                            : "rgba(100,116,139,0.06)",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pl-11">
        <div className="flex flex-1 gap-[2px]">
          {slots.map((s) => (
            <span key={s} className="flex-1 text-center text-[10px] text-soft">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-soft">
        Less
        {[0.15, 0.35, 0.55, 0.75, 0.95].map((o) => (
          <span key={o} className="inline-block h-3 w-3 rounded-[3px]" style={{ background: `rgba(${rgb} / ${o})` }} />
        ))}
        More
      </div>
    </div>
  );
}

function hexToRgbTriplet(hex: string): string {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0, 2), 16)} ${parseInt(h.slice(2, 4), 16)} ${parseInt(h.slice(4, 6), 16)}`;
}

/* ------------------------------------------------------------------
   Rating histogram — star-distribution bars
   ------------------------------------------------------------------ */
export function RatingHistogram({
  data,
  height = 180,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const t = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid {...t.grid} vertical={false} />
        <XAxis dataKey="label" tick={t.axis} axisLine={false} tickLine={false} />
        <YAxis tick={t.axis} axisLine={false} tickLine={false} />
        <Tooltip {...(t.tooltip as any)} cursor={t.tooltip.cursor} />
        <Bar dataKey="value" name="Reviews" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------
   Horizontal bar list — cities, regions, priorities
   ------------------------------------------------------------------ */
export function HBarList({
  data,
  color = BRAND,
  suffix = "",
}: {
  data: { label: string; value: number; display?: string }[];
  color?: string;
  suffix?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-main">{d.label}</span>
            <span className="tabular-nums font-semibold text-soft">{d.display ?? `${d.value}${suffix}`}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max((d.value / max) * 100, 4)}%`, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}