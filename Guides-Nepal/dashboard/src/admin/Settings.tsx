import Table from "../components/Table"
import { mockSettings } from "../mock/data"

export default function AdminSettings() {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-darkBlue">System settings</div>
      <Table columns={[{ key: "key", label: "Key" }, { key: "value", label: "Value" }]} rows={mockSettings} />
    </div>
  )
}
