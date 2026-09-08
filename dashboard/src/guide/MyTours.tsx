import Table from "../components/Table"
import { mockExperiences } from "../mock/data"

export default function GuideMyTours() {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-darkBlue">My tours</div>
      <Table
        columns={[
          { key: "title", label: "Title" },
          { key: "city", label: "City" },
          { key: "duration", label: "Duration" },
          { key: "status", label: "Status" }
        ]}
        rows={mockExperiences}
      />
    </div>
  )
}
