import { useEffect, useState } from "react";
import PageShell from "./PageShell";
import Table from "./Table";
import Badge from "./Badge";
import Loading from "./Loading";
import { getAdminUsers } from "../services/api";
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
  "super-admin": "danger",
  admin: "primary",
  "content-writer": "info",
  "regional-head": "info",
  "customer-support": "warning",
  host: "success",
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

  useEffect(() => {
    setLoading(true);
    getAdminUsers()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => setError(e?.response?.data?.detail || "Could not load users"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title={title} description={description}>
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
                const role = normalizeRole(r.role) ?? "traveler";
                return <Badge variant={ROLE_TONE[role] ?? "default"}>{role.replace("-", " ")}</Badge>;
              },
            },
            { key: "region", label: "Region", render: (r) => r.region || <span className="text-gray-400">—</span> },
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