import { useState, useEffect } from "react"
import Table from "../components/Table"
import Modal from "../components/Modal"
import GuideForm from "../components/forms/GuideForm"
import { getAdminGuides, verifyGuide, suspendGuide, deleteGuide, updateAdminGuide } from "../services/api"

export default function AdminGuides() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openEdit, setOpenEdit] = useState<{ idx: number } | null>(null)
  const [openAdd, setOpenAdd] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    setLoading(true)
    try {
      const data = await getAdminGuides()
      if (Array.isArray(data)) {
        setRows(data)
      }
    } catch (error) {
      console.error("Error fetching guides:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (guideId: number, idx: number) => {
    setActionLoading(guideId)
    try {
      await verifyGuide(guideId)
      setRows((prev) => prev.map((x, i) => (idx === i ? { ...x, verified: true } : x)))
    } catch (error) {
      console.error("Error verifying guide:", error)
      alert("Failed to verify guide")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspend = async (guideId: number, idx: number) => {
    setActionLoading(guideId)
    try {
      await suspendGuide(guideId)
      setRows((prev) => prev.map((x, i) => (idx === i ? { ...x, is_active: false } : x)))
    } catch (error) {
      console.error("Error suspending guide:", error)
      alert("Failed to suspend guide")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (guideId: number, idx: number) => {
    if (!confirm("Are you sure you want to delete this guide?")) return
    setActionLoading(guideId)
    try {
      await deleteGuide(guideId)
      setRows((prev) => prev.filter((_, i) => i !== idx))
    } catch (error) {
      console.error("Error deleting guide:", error)
      alert("Failed to delete guide")
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = async (v: any, idx: number) => {
    const guide = rows[idx]
    setActionLoading(guide.id)
    try {
      await updateAdminGuide(guide.id, { name: v.name, role: v.level })
      setRows((prev) => prev.map((x, i) => (idx === i ? { ...x, name: v.name, role: v.level } : x)))
      setOpenEdit(null)
    } catch (error) {
      console.error("Error updating guide:", error)
      alert("Failed to update guide")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-darkBlue">Guides</div>
        <button className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold" onClick={() => setOpenAdd(true)}>
          Add guide
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table
          columns={[
            { key: "name", label: "Name" },
            { key: "verified", label: "Verified", render: (r: any) => r.verified ? "Yes" : "No" },
            { key: "role", label: "Role" },
            { key: "rating", label: "Rating" },
            { key: "reviews", label: "Reviews" },
            { key: "languages", label: "Languages", render: (r: any) => r.languages?.join(", ") },
            {
              key: "actions",
              label: "Actions",
              render: (_r: any, i?: number) => {
                const guide = _r
                const isLoading = actionLoading === guide.id
                return (
                  <div className="flex gap-2">
                    <button className="rounded-lg px-2 py-1 border disabled:opacity-50" onClick={() => setOpenEdit({ idx: i! })} disabled={isLoading}>Edit</button>
                    {!guide.verified && (
                      <button className="rounded-lg px-2 py-1 border bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50" onClick={() => handleVerify(guide.id, i!)} disabled={isLoading}>Verify</button>
                    )}
                    <button className="rounded-lg px-2 py-1 border bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:opacity-50" onClick={() => handleSuspend(guide.id, i!)} disabled={isLoading}>Suspend</button>
                    <button className="rounded-lg px-2 py-1 border bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50" onClick={() => handleDelete(guide.id, i!)} disabled={isLoading}>Remove</button>
                  </div>
                )
              }
            }
          ]}
          rows={rows}
        />
      )}
      <Modal open={openEdit !== null} title="Edit guide" onClose={() => setOpenEdit(null)}>
        {openEdit !== null && (
          <GuideForm
            initial={{ name: rows[openEdit.idx].name, level: rows[openEdit.idx].role, status: rows[openEdit.idx].verified ? "verified" : "pending" }}
            onSubmit={(v) => handleEdit(v, openEdit.idx)}
          />
        )}
      </Modal>
      <Modal open={openAdd} title="Add guide" onClose={() => setOpenAdd(false)}>
        <GuideForm onSubmit={() => { setOpenAdd(false); fetchGuides() }} />
      </Modal>
    </div>
  )
}