import PageShell from "../components/PageShell";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";

const HIERARCHY = [
  { role: "super-admin", emoji: "🛡️", label: "Super Admin", note: "Full system", level: 1 },
  { role: "admin", emoji: "⚙️", label: "Admin", note: "Full system", level: 2 },
  { role: "content-writer", emoji: "✍️", label: "Content Writer", note: "CMS creator", level: 3 },
  { role: "regional-head", emoji: "🗺️", label: "Regional Head", note: "Scoped by region", level: 4 },
  { role: "customer-support", emoji: "🎧", label: "Customer Support", note: "Tickets & FAQ", level: 5 },
  { role: "host", emoji: "🏠", label: "Host (approved)", note: "Own records", level: 6 },
  { role: "guide", emoji: "🧭", label: "Guide (approved)", note: "Own records", level: 7 },
  { role: "traveler", emoji: "🎒", label: "Traveler (default)", note: "Public site", level: 8 },
];

type Perm = "full" | "own" | "region" | "no";
const ROLES = ["super-admin", "admin", "regional-head", "customer-support", "content-writer", "host", "guide", "traveler"];
const ROW_LABELS: Record<string, string> = {
  "super-admin": "Super\nAdmin",
  admin: "Admin",
  "regional-head": "Regional\nHead",
  "customer-support": "Cust.\nSupport",
  "content-writer": "Writer",
};

const MATRIX: { area: string; perms: Record<string, Perm> }[] = [
  { area: "Users & roles", perms: { "super-admin": "full", admin: "full", "regional-head": "no", "customer-support": "no", "content-writer": "no", host: "no", guide: "no", traveler: "no" } },
  { area: "Host applications", perms: { "super-admin": "full", admin: "full", "regional-head": "region", "customer-support": "no", "content-writer": "no", host: "no", guide: "no", traveler: "no" } },
  { area: "Support tickets", perms: { "super-admin": "full", admin: "no", "regional-head": "no", "customer-support": "full", "content-writer": "no", host: "no", guide: "no", traveler: "no" } },
  { area: "Website content", perms: { "super-admin": "full", admin: "full", "regional-head": "no", "customer-support": "no", "content-writer": "own", host: "no", guide: "no", traveler: "no" } },
  { area: "Pages, blog & SEO", perms: { "super-admin": "full", admin: "full", "regional-head": "no", "customer-support": "no", "content-writer": "own", host: "no", guide: "no", traveler: "no" } },
  { area: "Media library", perms: { "super-admin": "full", admin: "full", "regional-head": "no", "customer-support": "no", "content-writer": "own", host: "no", guide: "no", traveler: "no" } },
  { area: "Tours & bookings", perms: { "super-admin": "full", admin: "full", "regional-head": "no", "customer-support": "no", "content-writer": "no", host: "own", guide: "own", traveler: "no" } },
  { area: "Earnings & payouts", perms: { "super-admin": "full", admin: "full", "regional-head": "no", "customer-support": "no", "content-writer": "no", host: "own", guide: "own", traveler: "no" } },
];

const PERM_CLASS: Record<Perm, { label: string; cls: string }> = {
  full: { label: "Full", cls: "bg-brand-100 text-darkBlue" },
  own: { label: "Own", cls: "bg-sky-100 text-sky-700" },
  region: { label: "Region", cls: "bg-amber-100 text-amber-700" },
  no: { label: "—", cls: "bg-gray-100 text-gray-400" },
};

export default function RoleHierarchy() {
  return (
    <PageShell
      title="Role Hierarchy"
      description="Who can do what — the RBAC model powering every console. Admin & Super Admin hold Full content access; writers, hosts and guides edit only their own."
      noCard
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Roles defined" value="8" icon="🛡️" accent="bg-brand-100" />
        <StatCard label="Console types" value="7" icon="🖥️" accent="bg-sky-100" />
        <StatCard label="Capability zones" value={String(MATRIX.length)} icon="🗂️" accent="bg-amber-50" />
        <StatCard label="Full-access admins" value="2" icon="👑" accent="bg-rose-100" />
      </div>

      <div className="space-y-2">
        {HIERARCHY.map((n) => (
          <div key={n.role} className="flex items-center gap-3 gn-card rounded-xl border border-gray-200/70 px-3.5 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-base">{n.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-darkBlue dark:text-slate-100">{n.label}</div>
              <div className="text-[11px] text-gray-500">{n.note}</div>
            </div>
            <Badge variant="info" size="sm">Level {n.level} / 8</Badge>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <h2 className="text-sm font-bold tracking-tight text-darkBlue dark:text-slate-100">Capability matrix</h2>
        <p className="mt-1 text-xs text-gray-500">
          Full = everything · Own = only their records · Region = their region only · — = no access
        </p>
      </div>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-gray-200/70">
        <table className="min-w-[820px] w-full text-sm">
          <thead className="border-b border-gray-200/70 bg-gray-50/70">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Area</th>
              {ROLES.map((r) => (
                <th key={r} className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {ROW_LABELS[r] ?? r.replace("-", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/70">
            {MATRIX.map((row) => (
              <tr key={row.area} className="transition hover:bg-gray-50/60">
                <td className="px-4 py-2.5 text-left font-semibold text-darkBlue dark:text-slate-100">{row.area}</td>
                {ROLES.map((r) => {
                  const p = PERM_CLASS[row.perms[r] ?? "no"];
                  return (
                    <td key={r} className="px-2 py-2.5 text-center">
                      <span className={`inline-block w-16 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.cls}`}>
                        {p.label}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 gn-card rounded-2xl border border-gray-200/70 text-xs text-gray-600 dark:text-slate-300">
        🔐 In production this maps to JWT claims + backend middleware (<span className="font-mono">/api/v1/admin/*</span> guards).
        Admin and Super Admin get full content access; content writers, hosts and guides only edit their own.
      </div>
    </PageShell>
  );
}