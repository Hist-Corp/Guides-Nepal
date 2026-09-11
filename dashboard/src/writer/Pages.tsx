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
import { FRONTEND_PAGES } from "../config/frontendPages";
import { getContentPages, createContentPage, updateContentPage, deleteContentPage } from "../services/api";
import { uploadMedia } from "../services/api";
import { compressImage, generatePreview } from "../utils/imageCompressor";
import ImagePicker from "../components/ImagePicker";

export type NewPagePayload = {
  title: string;
  slug: string;
  status?: string;
  content?: string;
  featuredImage?: string;
};

export type PageRecord = {
  id: number;
  title: string;
  slug: string;
  status?: string;
  content?: string;
  path?: string;
  featuredImage?: string;
  visible?: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function PageIcon({ slug }: { slug: string }) {
  const page = FRONTEND_PAGES.find((p) => p.slug === slug);
  return <span className="text-lg">{page?.icon || "📄"}</span>;
}

export default function WriterPages() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<PageRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [form, setForm] = useState<NewPagePayload>({ title: "", slug: "" });
  const [liveEdit, setLiveEdit] = useState<PageRecord | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await getContentPages();
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const resetForm = () => {
    setForm({ title: "", slug: "" });
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setActionLoading(-1);
    try {
      let imageUrl = "";
      if (featuredImageFile) {
        const compressed = await compressImage(featuredImageFile);
        const result = await uploadMedia(compressed);
        imageUrl = result?.url || "";
      }
      await createContentPage({
        title: form.title,
        slug: form.slug || slugify(form.title),
        status: "draft",
        featuredImage: imageUrl,
      });
      setOpenCreate(false);
      resetForm();
      fetchPages();
    } catch (error) {
      console.error("Error creating page:", error);
      alert("Failed to create page");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async () => {
    if (!form.title.trim() || !openEdit) return;
    setActionLoading(openEdit.id);
    try {
      let imageUrl = form.featuredImage;
      if (featuredImageFile) {
        const compressed = await compressImage(featuredImageFile);
        const result = await uploadMedia(compressed);
        imageUrl = result?.url || "";
      }
      await updateContentPage(openEdit.id, {
        title: form.title,
        slug: form.slug,
        featuredImage: imageUrl,
      });
      setOpenEdit(null);
      resetForm();
      fetchPages();
    } catch (error) {
      console.error("Error updating page:", error);
      alert("Failed to update page");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (pageId: number) => {
    if (!confirm("Delete this page?")) return;
    setActionLoading(pageId);
    try {
      await deleteContentPage(pageId);
      fetchPages();
    } catch (error) {
      console.error("Error deleting page:", error);
      alert("Failed to delete page");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (pageId: number) => {
    setActionLoading(pageId);
    try {
      await updateContentPage(pageId, { status: "published" });
      fetchPages();
    } catch (error) {
      console.error("Error publishing page:", error);
      alert("Failed to publish page");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVisibility = async (page: PageRecord) => {
    setActionLoading(page.id);
    try {
      await updateContentPage(page.id, { visible: !page.visible });
      fetchPages();
    } catch (error) {
      console.error("Error updating visibility:", error);
      alert("Failed to update visibility");
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (page: PageRecord) => {
    setOpenEdit(page);
    setForm({ title: page.title, slug: page.slug, content: page.content, featuredImage: page.featuredImage });
    setFeaturedImagePreview(page.featuredImage || "");
    setFeaturedImageFile(null);
  };

  const columns: Column<PageRecord>[] = [
    {
      key: "icon",
      label: "",
      render: (r) => <PageIcon slug={r.slug} />,
    },
    {
      key: "featuredImage",
      label: "Image",
      render: (r) =>
        r.featuredImage ? (
          <img src={r.featuredImage} alt="" className="w-12 h-8 object-cover rounded" />
        ) : (
          <span className="text-xs text-gray-400">None</span>
        ),
    },
    { key: "title", label: "Title" },
    { key: "slug", label: "Slug" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {r.visible === false && (
            <Badge variant="warning" size="sm">Hidden</Badge>
          )}
          <Badge variant={statusVariant(r.status)} size="sm">
            {r.status || "draft"}
          </Badge>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setLiveEdit(r)} disabled={actionLoading === r.id}>
            Edit
          </Button>
          <button
            onClick={() => handleToggleVisibility(r)}
            disabled={actionLoading === r.id}
            title={r.visible === false ? "Show page" : "Hide page"}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            {r.visible === false ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          {(r.status || "draft") !== "published" && (
            <Button variant="ghost" size="sm" onClick={() => handlePublish(r.id)} disabled={actionLoading === r.id}>
              Publish
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)} disabled={actionLoading === r.id}>
            {actionLoading === r.id ? "Removing…" : "Remove"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Pages"
      description="Manage static frontend pages for your website."
      action={
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-full border border-gray-200 bg-white/80 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${viewMode === "list" ? "bg-darkBlue text-white" : "text-gray-500 hover:text-darkBlue"}`}
            >
              ☰ List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${viewMode === "cards" ? "bg-darkBlue text-white" : "text-gray-500 hover:text-darkBlue"}`}
            >
              ▦ Cards
            </button>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setOpenCreate(true);
            }}
            disabled={actionLoading === -1}
          >
            Add Page
          </Button>
        </div>
      }
    >
      {loading ? (
        <Loading label="Loading pages…" />
      ) : viewMode === "list" ? (
        <Table
          columns={columns}
          rows={pages}
          emptyMessage="No pages found. Add a page to get started."
        />
      ) : pages.length === 0 ? (
        <div className="text-sm text-gray-500 py-10 text-center">No pages found. Add a page to get started.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pages.map((p) => (
            <div key={p.id} className="gn-card rounded-2xl border border-gray-200/70 overflow-hidden flex flex-col">
              {p.featuredImage ? (
                <img src={p.featuredImage} alt="" className="h-28 w-full object-cover" />
              ) : (
                <div className="h-28 w-full bg-gradient-to-br from-darkBlue to-[#3a5a78] grid place-items-center text-3xl">
                  {PageIcon({ slug: p.slug })}
                </div>
              )}
              <div className="p-3.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{PageIcon({ slug: p.slug })}</span>
                  <h3 className="font-bold text-darkBlue truncate flex-1">{p.title}</h3>
                </div>
                <div className="text-xs text-gray-500 mt-1">/{p.slug}</div>
                <div className="mt-2">
                  <Badge variant={statusVariant(p.status)} size="sm">{p.status || "draft"}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5 border-t border-gray-200/70 pt-2 pb-1.5 px-3.5">
                <Button variant="ghost" size="sm" onClick={() => setLiveEdit(p)} disabled={actionLoading === p.id}>
                  Edit
                </Button>
                {(p.status || "draft") !== "published" && (
                  <Button variant="ghost" size="sm" onClick={() => handlePublish(p.id)} disabled={actionLoading === p.id}>
                    Publish
                  </Button>
                )}
                <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)} disabled={actionLoading === p.id}>
                  {actionLoading === p.id ? "Removing…" : "Remove"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={openCreate} title="Add Page" onClose={() => setOpenCreate(false)}>
        <div className="space-y-4">
          <Field label="Page Title" placeholder="Enter page title" value={form.title} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, title: e.target.value })} />
          <Field label="Slug" placeholder="page-slug" value={form.slug} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, slug: e.target.value })} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Featured Image</p>
            <ImagePicker
              buttonText="Upload featured image"
              previewUrl={featuredImagePreview}
              onSelect={async (file) => {
                setFeaturedImageFile(file);
                const preview = await generatePreview(file);
                setFeaturedImagePreview(preview);
              }}
              onClear={() => {
                setFeaturedImageFile(null);
                setFeaturedImagePreview("");
              }}
            />
          </div>
          <Button variant="primary" className="w-full" onClick={handleCreate} disabled={!form.title.trim() || actionLoading === -1 || uploadingImage}>
            {actionLoading === -1 ? "Adding…" : "Add Page"}
          </Button>
        </div>
      </Modal>

      <Modal open={openEdit !== null} title="Edit Page" onClose={() => setOpenEdit(null)}>
        <div className="space-y-4">
          <Field label="Page Title" placeholder="Enter page title" value={form.title} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, title: e.target.value })} />
          <Field label="Slug" placeholder="page-slug" value={form.slug} onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, slug: e.target.value })} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">Featured Image</p>
            <ImagePicker
              buttonText="Change featured image"
              previewUrl={featuredImagePreview}
              onSelect={async (file) => {
                setFeaturedImageFile(file);
                const preview = await generatePreview(file);
                setFeaturedImagePreview(preview);
              }}
              onClear={() => {
                setFeaturedImageFile(null);
                setFeaturedImagePreview("");
              }}
            />
          </div>
          <Button variant="primary" className="w-full" onClick={handleEdit} disabled={!form.title.trim() || actionLoading === openEdit?.id || uploadingImage}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {liveEdit && (
        <LivePageEditor
          slug={liveEdit.slug}
          title={liveEdit.title}
          path={liveEdit.path || undefined}
          initialSections={[
            {
              id: "page-hero",
              title: "Header Section",
              type: "hero",
              content: {
                heading: liveEdit.title,
                subtitle: "Manage your dynamic page content",
                buttonText: "Get Started",
                tagline: liveEdit.slug,
              },
              style: {
                backgroundColor: "#213448",
                textColor: "#ffffff",
                accentColor: "#F4B400",
                alignment: "left",
                headingSize: "2.5rem",
                padding: "3rem",
              },
            },
            {
              id: "page-body",
              title: "Page Body",
              type: "text",
              content: {
                heading: "",
                body: liveEdit.content || "Edit your page content here.",
              },
              style: {
                backgroundColor: "#ffffff",
                textColor: "#213448",
                alignment: "left",
                padding: "2.5rem",
              },
            },
          ]}
onSaved={async (sections) => {
            const hero = sections.find((s) => s.type === "hero");
            const body = sections.find((s) => s.type === "text");
            if (hero?.content?.heading || body?.content?.body) {
              try {
                await updateContentPage(liveEdit.id, {
                  title: hero?.content?.heading || liveEdit.title,
                  content: body?.content?.body,
                });
              } catch {
                // sections already persisted
              }
            }
          }}
          onClose={() => { setLiveEdit(null); fetchPages(); }}
        />
      )}
    </PageShell>
  );
}