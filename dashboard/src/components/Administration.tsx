import { useEffect, useState } from "react";
import PageShell from "./PageShell";
import Table from "./Table";
import Badge from "./Badge";
import Loading from "./Loading";
import { getAdminUsers, updateAdminUser } from "../services/api";
import { normalizeRole } from "../utils/roles";

type AdminUser = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  region?: string;
  is_active?: boolean;
};

const ROLE_TONE: Record<string, "info" | "primary" | "success" | "default" | "danger" | "warning"> = {
  admin: "primary",
  "content-manager": "info",
  "regional-head": "info",
  "customer-support": "warning",
  host: "success",
  // Guide accounts exist on the platform but have no dashboard console, so
  // normalizeRole() returns null for them. Fall back to the stored role instead
  // of mislabelling them as travelers.
  guide: "success",
  traveler: "default",
};

export default function Administration({
  title = "Administration",
  description = "Accounts across all roles on the platform.",
}: {
  title?: string;
  description?: string;
}) {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateRegion = async (user: AdminUser) => {
    setSavingId(user.id);
    setActionError(null);
    setMessage(null);
    try {
      await updateAdminUser(user.id, { region: user.region?.trim() || null });
      setMessage(`Region updated for ${user.email}.`);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setActionError(typeof detail === "string" ? detail : "Could not update regional head region.");
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    getAdminUsers()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => (() => { const _d = e?.response?.data?.detail; const _m = typeof _d === 'string' ? _d : (Array.isArray(_d) ? _d.map((x: any) => (typeof x === 'string' ? x : x?.msg || JSON.stringify(x))).join(' ') : (_d && typeof _d === 'object' ? (_d.msg || JSON.stringify(_d)) : null)); setError(_m || "Could not load users"); })())
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title={title} description={description}>
      {message && <p role="status" className="mb-4 text-sm text-green-700">{message}</p>}
      {actionError && <p role="alert" className="mb-4 text-sm text-red-700">{actionError}</p>}
      {loading ? (
        <Loading label="Loading accounts..." />
      ) : error ? (
        <p className="text-sm text-gray-500 py-10 text-center">{error}</p>
      ) : (
        <Table
          rows={rows}
          rowKey={(r) => r.id}
          emptyMessage="No accounts yet."
          columns={[
            { key: "id", label: "ID", render: (r) => <span className="tabular-nums text-gray-500">#{r.id}</span> },
            {
              key: "email",
              label: "Account",
              render: (r) => (
                <div>
                  <div className="font-medium text-darkBlue">{r.email}</div>
                  <div className="text-xs text-gray-400">
                    {`${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || "—"}
                  </div>
                </div>
              ),
            },
            {
              key: "role",
              label: "Role",
              render: (r) => {
                const stored = (r.role ?? "traveler").toLowerCase();
                const role = normalizeRole(r.role) ?? stored;
                return <Badge variant={ROLE_TONE[role] ?? "default"}>{role.replace(/-/g, " ")}</Badge>;
              },
            },
            {
              key: "region",
              label: "Region",
              render: (r) => {
                if (normalizeRole(r.role) !== "regional-head") {
                  return r.region || <span className="text-gray-400">—</span>;
                }
                return (
                  <div className="flex min-w-64 items-center gap-2">
                    <select
                      aria-label={`Region for ${r.email}`}
                      className="min-w-0 flex-1 rounded-lg border border-line bg-white px-2 py-1.5"
                      value={r.region ?? ""}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((row) =>
                            row.id === r.id ? { ...row, region: event.target.value } : row,
                          ),
                        )
                      }
                    >
                      <option value="">Unassigned</option>
                      {[
                        "Koshi",
                        "Madhesh",
                        "Bagmati",
                        "Gandaki",
                        "Lumbini",
                        "Karnali",
                        "Sudurpashchim",
                      ].map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                      {r.region && ![
                        "Koshi",
                        "Madhesh",
                        "Bagmati",
                        "Gandaki",
                        "Lumbini",
                        "Karnali",
                        "Sudurpashchim",
                      ].includes(r.region) && <option value={r.region}>{r.region}</option>}
                    </select>
                    <button
                      type="button"
                      onClick={() => void updateRegion(r)}
                      disabled={savingId === r.id}
                      className="rounded-lg border border-line px-2 py-1.5 text-xs font-semibold text-darkBlue hover:bg-surface-2 disabled:opacity-50"
                    >
                      {savingId === r.id ? "Saving…" : "Save"}
                    </button>
                  </div>
                );
              },
            },
            {
              key: "is_active",
              label: "Status",
              render: (r) =>
                r.is_active === false ? <Badge variant="archived">Suspended</Badge> : <Badge variant="success">Active</Badge>,
            },
          ]}
        />
      )}
    </PageShell>
  );
}