import Table from "../components/Table"
import { mockGuides } from "../mock/data"

export default function HostGuides() {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-darkBlue">Your guides</div>
      <Table
        columns={[
          { key: "name", label: "Name" },
          { key: "verified", label: "Verified" },
          { key: "rating", label: "Rating" },
          { key: "reviews", label: "Reviews" }
        ]}
        rows={mockGuides}
      />
    </div>
  )
}
