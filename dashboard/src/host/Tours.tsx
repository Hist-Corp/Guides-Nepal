import Table from "../components/Table"
import { mockExperiences } from "../mock/data"

export default function HostTours() {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-darkBlue">Your tours</div>
      <Table
        columns={[
          { key: "title", label: "Title" },
          { key: "city", label: "City" },
          { key: "price", label: "Price", render: (r: any) => `$${r.price}` },
          { key: "duration", label: "Duration" },
          { key: "status", label: "Status" }
        ]}
        rows={mockExperiences}
      />
    </div>
  )
}
