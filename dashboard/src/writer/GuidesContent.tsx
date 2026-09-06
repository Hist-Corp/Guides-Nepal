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
import LivePageEditor from "./LivePageEditor";
import {
  getContentGuides,
  createContentGuide,
  updateContentGuide,
  deleteContentGuide,
} from "../services/api";

type GuideContent = {
  id: number;
  title: string;
  type: string;
  status?: string;
  body?: string;
  highlights?: string[];
};

export default function WriterGuidesContent() {
  const [contents, setContents] = useState<GuideContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<GuideContent | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", type: "description" });
  const [liveEdit, setLiveEdit] = useState<GuideContent | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await getContentGuides();
      setContents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching guides content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const resetForm = () => setForm({ title: "", type: "description" });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setActionLoading(-1);
    try {
      await createContentGuide({ title: form.title, type: form.type });
      setOpenCreate(false);
      resetForm();
      fetchContent();
    } catch (error) {
      console.error("Error creating content:", error);
      alert("Failed to create content");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async () => {
    if (!form.title.trim() || !openEdit) return;
    setActionLoading(openEdit.id);
    try {
      await updateContentGuide(openEdit.id, { title: form.title, type: form.type });
      setOpenEdit(null);
      resetForm();
      fetchContent();
    } catch (error) {
      console.error("Error updating content:", error);
      alert("Failed to update content");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (contentId: number) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    setActionLoading(contentId);
    try {
      await deleteContentGuide(contentId);
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content");
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (content: GuideContent) => {
    setOpenEdit(content);
    setForm({ title: content.title, type: content.type });
  };

  const columns: Column<GuideContent>[] = [
    { key: "title", label: "Title" },
    {
      key: "type",
      label: "Type",
      render: (r) => <span className="text-sm text-gray-600">{r.type}</span>,
    },
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
          <Button variant="ghost" size="sm" onClick={() => setLiveEdit(r)} disabled={actionLoading === r.id}>
            Live
          </Button>
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
      title="Guides Content"
      description="Manage experience descriptions, itineraries and FAQs for guide profiles."
      action={
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
          disabled={actionLoading === -1}
        >
          Add content
        </Button>
      }
    >
      {loading ? (
        <Loading label="Loading guides content…" />
      ) : (
        <Table
          columns={columns}
          rows={contents}
          emptyMessage="No guides content found. Add your first content entry."
        />
      )}

      <Modal open={openCreate} title="Add Content" onClose={() => setOpenCreate(false)}>
        <div className="space-y-4">
          <Field label="Title" placeholder="Enter title" value={form.title} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, title: e.target.value })} />
          <Field
            as="select"
            label="Type"
            value={form.type}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, type: e.target.value })}
          >
            <option value="description">Description</option>
            <option value="itinerary">Itinerary</option>
            <option value="faq">FAQ</option>
          </Field>
          <Button variant="primary" className="w-full" onClick={handleCreate} disabled={!form.title.trim() || actionLoading === -1}>
            {actionLoading === -1 ? "Adding…" : "Add Content"}
          </Button>
        </div>
      </Modal>

      <Modal open={openEdit !== null} title="Edit Content" onClose={() => setOpenEdit(null)}>
        <div className="space-y-4">
          <Field label="Title" placeholder="Enter title" value={form.title} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, title: e.target.value })} />
          <Field as="select" label="Type" value={form.type} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, type: e.target.value })}>
            <option value="description">Description</option>
            <option value="itinerary">Itinerary</option>
            <option value="faq">FAQ</option>
          </Field>
          <Button variant="primary" className="w-full" onClick={handleEdit} disabled={!form.title.trim() || actionLoading === openEdit?.id}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {liveEdit && (
        <LivePageEditor
          slug={`guides-${liveEdit.id}`}
          title={liveEdit.title}
          path="/explore"
          initialSections={[
            {
              id: "gc-hero",
              title: "Content Header",
              type: "hero",
              content: {
                heading: liveEdit.title,
                subtitle: `Type: ${liveEdit.type} - Status: ${liveEdit.status || "draft"}`,
                buttonText: "",
                tagline: liveEdit.type,
              },
              style: {
                backgroundColor: "#213448",
                textColor: "#ffffff",
                accentColor: "#F4B400",
                alignment: "left",
                headingSize: "2.2rem",
                padding: "3rem",
              },
            },
            {
              id: "gc-body",
              title: "Content Body",
              type: "text",
              content: {
                heading: "",
                body: liveEdit.body || "Write the content here. Click this section in the preview to edit the text.",
              },
              style: {
                backgroundColor: "#ffffff",
                textColor: "#213448",
                alignment: "left",
                padding: "2.5rem",
              },
            },
            {
              id: "gc-highlights",
              title: "Highlights",
              type: "values",
              content: {
                heading: "Highlights",
                items: liveEdit.highlights || ["Highlight one", "Highlight two"],
              },
              style: {
                backgroundColor: "#f8f8f8",
                textColor: "#213448",
                alignment: "center",
              },
            },
          ]}
          onSaved={async (sections) => {
            const hero = sections.find((s) => s.id === "gc-hero");
            const body = sections.find((s) => s.id === "gc-body");
            const highlights = sections.find((s) => s.id === "gc-highlights");
            if (hero?.content?.heading || body?.content?.body) {
              try {
                await updateContentGuide(liveEdit.id, {
                  title: hero?.content?.heading || liveEdit.title,
                  body: body?.content?.body,
                  highlights: highlights?.content?.items,
                });
              } catch {
                // sections already persisted
              }
            }
          }}
          onClose={fetchContent}
        />
      )}
    </PageShell>
  );
}