import { useEffect, useState } from "react";
import PageShell from "./PageShell";
import Table from "./Table";
import Badge from "./Badge";
import Loading from "./Loading";
import { getAdminUsers } from "../services/api";

type Customer = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  region?: string;
  is_active?: boolean;
};

export default function Customers({
  title = "Customers",
  description = "People who book and explore experiences on the platform.",
}: {
  title?: string;
  description?: string;
}) {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAdminUsers("traveler")
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => setError(e?.response?.data?.detail || "Could not load customers"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title={title} description={description}>
      {loading ? (
        <Loading label="Loading customers..." />
      ) : error ? (
        <p className="text-sm text-gray-500 py-10 text-center">{error}</p>
      ) : (
        <Table
          rows={rows}
          rowKey={(r) => r.id}
          emptyMessage="No customers yet."
          columns={[
            { key: "id", label: "ID", render: (r) => <span className="tabular-nums text-gray-500">#{r.id}</span> },
            {
              key: "name",
              label: "Name",
              render: (r) =>
                `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || <span className="text-gray-400">—</span>,
            },
            { key: "email", label: "Email" },
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