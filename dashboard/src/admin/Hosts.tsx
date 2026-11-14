import { useState } from "react"
import Table from "../components/Table"
import Modal from "../components/Modal"
import HostForm from "../components/forms/HostForm"
import { mockHosts } from "../mock/data"

export default function AdminHosts() {
  const [rows, setRows] = useState(mockHosts)
  const [openEdit, setOpenEdit] = useState<{ idx: number } | null>(null)
  const [openAdd, setOpenAdd] = useState(false)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-darkBlue">Hosts</div>
        <button className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold" onClick={() => setOpenAdd(true)}>
          Add host
        </button>
      </div>
      <Table
        columns={[
          { key: "name", label: "Name" },
          { key: "city", label: "City" },
          { key: "status", label: "Status" },
          { key: "featured", label: "Featured" },
          { key: "guidesCount", label: "Guides" },
          { key: "experiencesCount", label: "Experiences" },
          { key: "revenueTotal", label: "Revenue", render: (r: any) => `$${r.revenueTotal}` },
          {
            key: "actions",
            label: "Actions",
            render: (_r: any, i?: number) => (
              <div className="flex gap-2">
                <button className="rounded-lg px-2 py-1 border" onClick={() => setOpenEdit({ idx: i! })}>Edit</button>
                <button
                  className="rounded-lg px-2 py-1 border"
                  onClick={() =>
                    setRows((prev) =>
                      prev.map((x, idx) => (idx === i ? { ...x, status: "suspended" } : x))
                    )
                  }
                >
                  Suspend
                </button>
                <button
                  className="rounded-lg px-2 py-1 border"
                  onClick={() =>
                    setRows((prev) =>
                      prev.map((x, idx) => (idx === i ? { ...x, featured: true, status: "active" } : x))
                    )
                  }
                >
                  Promote
                </button>
                <button
                  className="rounded-lg px-2 py-1 border"
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              </div>
            )
          }
        ]}
        rows={rows}
      />
      <Modal
        open={openEdit !== null}
        title="Edit host"
        onClose={() => setOpenEdit(null)}
      >
        {openEdit !== null && (
          <HostForm
            initial={{
              name: rows[openEdit.idx].name,
              city: rows[openEdit.idx].city,
              status: rows[openEdit.idx].status
            }}
            onSubmit={(v) => {
              setRows((prev) =>
                prev.map((x, idx) => (idx === openEdit.idx ? { ...x, name: v.name, city: v.city, status: v.status } : x))
              )
              setOpenEdit(null)
            }}
          />
        )}
      </Modal>
      <Modal open={openAdd} title="Add host" onClose={() => setOpenAdd(false)}>
        <HostForm
          onSubmit={(v) => {
            setRows((prev) => [
              { id: Math.floor(Math.random() * 10000), name: v.name, city: v.city, status: v.status, featured: false, guidesCount: 0, experiencesCount: 0, revenueTotal: 0 },
              ...prev
            ])
            setOpenAdd(false)
          }}
        />
      </Modal>
    </div>
  )
}
