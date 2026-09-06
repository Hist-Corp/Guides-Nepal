import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import PageShell from "../components/PageShell";
import Table, { Column } from "../components/Table";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import Field from "../components/Field";
import { statusVariant } from "../utils/statusVariant";
import { getSeo, createSeo, updateSeo, deleteSeo } from "../services/api";

type SeoPage = {
  id: number;
  page: string;
  path: string;
  title: string;
  description: string;
  keywords?: string;
  status?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function WriterSeo() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<SeoPage | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [form, setForm] = useState({
    page: "",
    path: "",
    title: "",
    description: "",
    keywords: "",
  });

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await getSeo();
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching SEO pages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const resetForm = () =>
    setForm({ page: "", path: "", title: "", description: "", keywords: "" });

  const handleCreate = async () => {
    if (!form.page.trim() || !form.title.trim()) return;
    setActionLoading(-1);
    try {
      await createSeo({ ...form, path: form.path || `/${slugify(form.page)}` });
      setOpenCreate(false);
      resetForm();
      fetchPages();
    } catch (error) {
      console.error("Error creating SEO page:", error);
      alert("Failed to create SEO page");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async () => {
    if (!form.page.trim() || !form.title.trim() || !openEdit) return;
    setActionLoading(openEdit.id);
    try {
      await updateSeo(openEdit.id, { ...form, path: form.path || `/${slugify(form.page)}` });
      setOpenEdit(null);
      resetForm();
      fetchPages();
    } catch (error) {
      console.error("Error updating SEO page:", error);
      alert("Failed to update SEO page");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (pageId: number) => {
    if (!confirm("Delete this SEO page?")) return;
    setActionLoading(pageId);
    try {
      await deleteSeo(pageId);
      fetchPages();
    } catch (error) {
      console.error("Error deleting SEO page:", error);
      alert("Failed to delete SEO page");
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (page: SeoPage) => {
    setOpenEdit(page);
    setForm({
      page: page.page,
      path: page.path,
      title: page.title,
      description: page.description,
      keywords: page.keywords || "",
    });
  };

  const columns: Column<SeoPage>[] = [
    { key: "page", label: "Page" },
    { key: "path", label: "Path" },
    { key: "title", label: "SEO Title" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge variant={statusVariant(r.status)} size="sm">
          {r.status || "draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(r)} disabled={actionLoading === r.id}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)} disabled={actionLoading === r.id}>
            {actionLoading === r.id ? "Removing…" : "Remove"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="SEO Management"
      description="Manage page titles, meta descriptions and keywords for SEO."
      action={
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
          disabled={actionLoading === -1}
        >
          Add SEO page
        </Button>
      }
    >
      {loading ? (
        <Loading label="Loading SEO pages…" />
      ) : (
        <Table
          columns={columns}
          rows={pages}
          emptyMessage="No SEO pages found. Add one to start managing your search metadata."
        />
      )}

      <Modal open={openCreate} title="Add SEO Page" onClose={() => setOpenCreate(false)}>
        <div className="space-y-4">
          <Field label="Page Name" placeholder="e.g. Home" value={form.page} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, page: e.target.value })} />
          <Field label="Slug/Path" placeholder="/home" value={form.path} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, path: e.target.value })} />
          <Field label="Meta Title" placeholder="SEO page title" value={form.title} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, title: e.target.value })} />
          <Field label="Meta Description" placeholder="Brief summary for search" value={form.description} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, description: e.target.value })} />
          <Field label="Keywords" placeholder="comma, separated, keywords" value={form.keywords} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, keywords: e.target.value })} />
          <Button variant="primary" className="w-full" onClick={handleCreate} disabled={!form.page.trim() || !form.title.trim() || actionLoading === -1}>
            {actionLoading === -1 ? "Saving…" : "Save SEO Page"}
          </Button>
        </div>
      </Modal>

      <Modal open={openEdit !== null} title="Edit SEO Page" onClose={() => setOpenEdit(null)}>
        <div className="space-y-4">
          <Field label="Page Name" placeholder="e.g. Home" value={form.page} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, page: e.target.value })} />
          <Field label="Slug/Path" placeholder="/home" value={form.path} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, path: e.target.value })} />
          <Field label="Meta Title" placeholder="SEO page title" value={form.title} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, title: e.target.value })} />
          <Field label="Meta Description" placeholder="Brief summary for search" value={form.description} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, description: e.target.value })} />
          <Field label="Keywords" placeholder="comma, separated, keywords" value={form.keywords} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, keywords: e.target.value })} />
          <Button variant="primary" className="w-full" onClick={handleEdit} disabled={!form.page.trim() || !form.title.trim() || actionLoading === openEdit?.id}>
            Save Changes
          </Button>
        </div>
      </Modal>
    </PageShell>
  );
}