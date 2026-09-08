import Table from "../components/Table"
import { mockPayouts } from "../mock/data"

export default function AdminRevenue() {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-darkBlue">Revenue & payouts</div>
      <Table
        columns={[
          { key: "id", label: "Run ID" },
          { key: "runDate", label: "Date" },
          { key: "amount", label: "Amount", render: (r: any) => `$${r.amount}` },
          { key: "status", label: "Status" },
          { key: "items", label: "Items" }
        ]}
        rows={mockPayouts}
      />
    </div>
  )
}
