import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import {
  deleteGuideApplication,
  getGuideApplicationDocument,
  getGuideApplications,
  reviewGuideApplication,
} from "../services/api"
import Modal from "./Modal"

export default function GuideApplicationsPanel() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null)
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({})
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!selectedApplication) {
      setDocumentUrls({})
      return
    }

    let cancelled = false
    const urls: string[] = []
    setDocumentError(null)
    Promise.all(
      (selectedApplication.uploaded_files ?? []).map(async (file: { key: string }) => {
        const blob = await getGuideApplicationDocument(selectedApplication.id, file.key)
        const url = URL.createObjectURL(blob)
        urls.push(url)
        return [file.key, url] as const
      }),
    )
      .then((entries) => {
        if (!cancelled) setDocumentUrls(Object.fromEntries(entries))
      })
      .catch(() => {
        if (!cancelled) setDocumentError("Unable to load application documents.")
      })

    return () => {
      cancelled = true
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedApplication])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getGuideApplications(filter ? { status_filter: filter } : undefined)
      setApps(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setApps([])
      setError(e?.response?.data?.detail || "Unable to load guide applications.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const review = async (id: number, status: "approved" | "rejected") => {
    try {
      await reviewGuideApplication(id, status)
      setMsg(`Guide application #${id} ${status}`)
      await load()
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "Action failed")
    }
  }

  const removeApplication = async (application: any) => {
    if (!window.confirm(`Delete the application from ${application.full_name}? Uploaded documents will also be deleted.`)) {
      return
    }
    setDeletingId(application.id)
    setError(null)
    setMsg(null)
    try {
      await deleteGuideApplication(application.id)
      setSelectedApplication(null)
      setMsg(`Guide application #${application.id} deleted.`)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Unable to delete guide application.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-darkBlue">Guide Applications</div>
        <div className="relative">
          <select
            className="appearance-none rounded-lg border border-line bg-surface px-4 py-2 pr-9 text-sm font-medium text-main shadow-sm transition-colors hover:border-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
        </div>
      </div>
      {msg && (
        <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
          {msg}
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div className="rounded-2xl bg-white border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="p-3">Guide</th>
              <th className="p-3">Email</th>
              <th className="p-3">City</th>
              <th className="p-3">Region</th>
              <th className="p-3">Status</th>
              <th className="p-3">Account</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={7}>Loading…</td></tr>
            ) : apps.length === 0 ? (
              <tr><td className="p-4 text-gray-500" colSpan={7}>No guide applications found</td></tr>
            ) : (
              apps.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-3 font-medium text-darkBlue">{a.full_name}</td>
                  <td className="p-3">{a.email}</td>
                  <td className="p-3">{a.city || "—"}</td>
                  <td className="p-3">{a.region || "—"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        a.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : a.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        a.account_status === "active"
                          ? "bg-green-100 text-green-700"
                          : a.account_status === "inactive"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {a.account_status || "not provisioned"}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => setSelectedApplication(a)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-darkBlue hover:bg-gray-50"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => review(a.id, "approved")}
                      disabled={a.status === "approved"}
                      className="rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-green-700 disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => review(a.id, "rejected")}
                      disabled={a.status === "rejected"}
                      className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-red-700 disabled:opacity-40"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => void removeApplication(a)}
                      disabled={deletingId === a.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                    >
                      {deletingId === a.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Modal
        open={selectedApplication !== null}
        title="Guide application details"
        onClose={() => setSelectedApplication(null)}
      >
        {selectedApplication && (
          <div className="space-y-6">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-gray-500">Full name</dt>
              <dd className="mt-1 text-darkBlue">{selectedApplication.full_name || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-500">Email</dt>
              <dd className="mt-1 break-all text-darkBlue">{selectedApplication.email || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-500">Phone</dt>
              <dd className="mt-1 text-darkBlue">{selectedApplication.phone || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-500">City</dt>
              <dd className="mt-1 text-darkBlue">{selectedApplication.city || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-500">Region</dt>
              <dd className="mt-1 text-darkBlue">{selectedApplication.region || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-500">National identity number</dt>
              <dd className="mt-1 text-darkBlue">{selectedApplication.nin_number || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-500">Application status</dt>
              <dd className="mt-1 capitalize text-darkBlue">{selectedApplication.status || "pending"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-500">Submitted</dt>
              <dd className="mt-1 text-darkBlue">
                {selectedApplication.created_at
                  ? new Date(selectedApplication.created_at).toLocaleString()
                  : "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-gray-500">Uploaded documents</dt>
              {documentError && <dd role="alert" className="mt-2 text-red-700">{documentError}</dd>}
              {(selectedApplication.uploaded_files ?? []).length === 0 ? (
                <dd className="mt-1 text-darkBlue">No uploaded documents.</dd>
              ) : (
                <dd className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedApplication.uploaded_files.map((file: {
                    key: string;
                    filename: string;
                    content_type: string;
                  }) => (
                    <div key={file.key} className="overflow-hidden rounded-xl border border-line bg-white">
                      <div className="border-b border-line px-3 py-2 text-xs font-semibold text-darkBlue">
                        {file.filename}
                      </div>
                      {documentUrls[file.key] ? (
                        file.content_type.startsWith("image/") ? (
                          <a href={documentUrls[file.key]} target="_blank" rel="noreferrer">
                            <img
                              src={documentUrls[file.key]}
                              alt={file.filename}
                              className="max-h-80 w-full bg-gray-50 object-contain"
                            />
                          </a>
                        ) : (
                          <iframe
                            src={documentUrls[file.key]}
                            title={file.filename}
                            className="h-80 w-full"
                          />
                        )
                      ) : (
                        <div className="flex h-40 items-center justify-center text-sm text-gray-500">
                          Loading document…
                        </div>
                      )}
                    </div>
                  ))}
                </dd>
              )}
            </div>
          </dl>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void removeApplication(selectedApplication)}
              disabled={deletingId === selectedApplication.id}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
            >
              {deletingId === selectedApplication.id ? "Deleting…" : "Delete application"}
            </button>
          </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
