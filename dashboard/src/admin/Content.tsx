import { NavLink } from "react-router-dom"
import { useState } from "react"
import Table from "../components/Table"
import Modal from "../components/Modal"
import WriterForm from "../components/forms/WriterForm"
import { mockWriters } from "../mock/data"

export default function AdminContent() {
  const [writers, setWriters] = useState(mockWriters)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState<{ idx: number } | null>(null)
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold text-darkBlue">Content Management</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-4 border border-gray-200">
          <NavLink to="/dashboard/content-writer/pages" className="block text-center py-4">
            <div className="font-semibold text-darkBlue">Pages</div>
            <div className="text-sm text-gray-600">Static pages and SEO metadata</div>
          </NavLink>
        </div>
        <div className="rounded-lg bg-white p-4 border border-gray-200">
          <NavLink to="/dashboard/content-writer/blog" className="block text-center py-4">
            <div className="font-semibold text-darkBlue">Blog</div>
            <div className="text-sm text-gray-600">Articles and editorial content</div>
          </NavLink>
        </div>
        <div className="rounded-lg bg-white p-4 border border-gray-200">
          <NavLink to="/dashboard/content-writer/guides-content" className="block text-center py-4">
            <div className="font-semibold text-darkBlue">Guides Content</div>
            <div className="text-sm text-gray-600">Experience descriptions and profiles</div>
          </NavLink>
        </div>
      </div>
      <div className="rounded-lg bg-white p-4 border border-gray-200 space-y-2">
        <div className="font-semibold text-darkBlue">Recent drafts</div>
        <ul className="space-y-2">
          <li className="flex items-center justify-between">
            <div className="text-sm">Bhaktapur Heritage Walk — description</div>
            <div className="text-xs text-gray-600">Draft</div>
          </li>
          <li className="flex items-center justify-between">
            <div className="text-sm">Homepage — hero copy</div>
            <div className="text-xs text-gray-600">Draft</div>
          </li>
        </ul>
      </div>
      <div className="rounded-lg bg-white p-4 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-darkBlue">Content Writers</div>
          <button className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold" onClick={() => setOpenAdd(true)}>
            Add content writer
          </button>
        </div>
        <Table
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "status", label: "Status" },
            {
              key: "actions",
              label: "Actions",
              render: (_r: any, i?: number) => (
                <div className="flex gap-2">
                  <button className="rounded-lg px-2 py-1 border" onClick={() => setOpenEdit({ idx: i! })}>Edit</button>
                  <button
                    className="rounded-lg px-2 py-1 border"
                    onClick={() =>
                      setWriters((prev) =>
                        prev.map((x, idx) => (idx === i ? { ...x, status: "suspended" } : x))
                      )
                    }
                  >
                    Suspend
                  </button>
                  <button
                    className="rounded-lg px-2 py-1 border"
                    onClick={() => setWriters((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                </div>
              )
            }
          ]}
          rows={writers}
        />
      </div>
      <Modal open={openAdd} title="Add content writer" onClose={() => setOpenAdd(false)}>
        <WriterForm
          onSubmit={(v) => {
            setWriters((prev) => [{ id: Math.floor(Math.random() * 10000), name: v.name, email: v.email, status: "active" }, ...prev])
            setOpenAdd(false)
          }}
        />
      </Modal>
      <Modal open={openEdit !== null} title="Edit content writer" onClose={() => setOpenEdit(null)}>
        {openEdit !== null && (
          <WriterForm
            initial={{ name: writers[openEdit.idx].name, email: writers[openEdit.idx].email }}
            onSubmit={(v) => {
              setWriters((prev) => prev.map((x, idx) => (idx === openEdit.idx ? { ...x, name: v.name, email: v.email } : x)))
              setOpenEdit(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
