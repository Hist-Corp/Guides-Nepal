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
  getContentBlog,
  createContentBlog,
  updateContentBlog,
  deleteContentBlog,
} from "../services/api";
import ImagePicker from "../components/forms/ImagePicker";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  author?: string;
  date?: string;
  status?: string;
  content?: string;
  featuredImage?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function WriterBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<BlogPost | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", featuredImage: "" });
  const [liveEdit, setLiveEdit] = useState<BlogPost | null>(null);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const data = await getContentBlog();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  const resetForm = () => {
    setForm({ title: "", slug: "", featuredImage: "" });
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setActionLoading(-1);
    try {
      await createContentBlog({
        title: form.title,
        slug: form.slug || slugify(form.title),
        featuredImage: form.featuredImage || undefined,
      });
      setOpenCreate(false);
      resetForm();
      fetchBlog();
    } catch (error) {
      console.error("Error creating article:", error);
      alert("Failed to create article");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async () => {
    if (!form.title.trim() || !openEdit) return;
    setActionLoading(openEdit.id);
    try {
      await updateContentBlog(openEdit.id, {
        title: form.title,
        slug: form.slug || slugify(form.title),
        featuredImage: form.featuredImage || undefined,
      });
      setOpenEdit(null);
      resetForm();
      fetchBlog();
    } catch (error) {
      console.error("Error updating article:", error);
      alert("Failed to update article");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    setActionLoading(postId);
    try {
      await deleteContentBlog(postId);
      fetchBlog();
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article");
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (post: BlogPost) => {
    setOpenEdit(post);
    setForm({ title: post.title, slug: post.slug, featuredImage: post.featuredImage || "" });
  };

  const columns: Column<BlogPost>[] = [
    { key: "title", label: "Title" },
    {
      key: "author",
      label: "Author",
      render: (r) => (
        <span className="text-sm text-gray-600">{r.author || "—"}</span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (r) => (
        <span className="text-sm text-gray-500">{r.date || "—"}</span>
      ),
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
      title="Blog"
      description="Manage your blog articles. Add, edit metadata and publish editorial content."
      action={
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
          disabled={actionLoading === -1}
        >
          Write article
        </Button>
      }
    >
      {loading ? (
        <Loading label="Loading articles…" />
      ) : (
        <Table
          columns={columns}
          rows={posts}
          emptyMessage="No articles found. Start by writing your first article."
        />
      )}

      <Modal open={openCreate} title="Write Article" onClose={() => setOpenCreate(false)}>
        <div className="space-y-4">
          <Field
            label="Article Title"
            placeholder="Enter article title"
            value={form.title}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, title: e.target.value })}
          />
          <Field
            label="Slug (optional)"
            placeholder="auto-generated"
            value={form.slug}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, slug: e.target.value })}
          />
          <ImagePicker
            label="Featured Image (optional)"
            value={form.featuredImage}
            onImageReady={(url) => {
              setForm({ ...form, featuredImage: url });
              setFeaturedPreview(url);
            }}
            onClear={() => {
              setForm({ ...form, featuredImage: "" });
              setFeaturedPreview("");
              setFeaturedImageFile(null);
            }}
            currentImageUrl={form.featuredImage}
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={handleCreate}
            disabled={!form.title.trim() || actionLoading === -1}
          >
            {actionLoading === -1 ? "Publishing…" : "Publish Article"}
          </Button>
        </div>
      </Modal>

      <Modal open={openEdit !== null} title="Edit Article" onClose={() => setOpenEdit(null)}>
        <div className="space-y-4">
          <Field
            label="Article Title"
            placeholder="Enter article title"
            value={form.title}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, title: e.target.value })}
          />
          <Field
            label="Slug"
            placeholder="article-slug"
            value={form.slug}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, slug: e.target.value })}
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={handleEdit}
            disabled={!form.title.trim() || actionLoading === openEdit?.id}
          >
            Save Changes
          </Button>
        </div>
      </Modal>

      {liveEdit && (
        <LivePageEditor
          slug={`blog-${liveEdit.id}`}
          title={liveEdit.title}
          path="/blog"
          initialSections={[
            {
              id: "blog-hero",
              title: "Article Header",
              type: "hero",
              content: {
                heading: liveEdit.title,
                subtitle: `${liveEdit.author || "Staff"} - ${liveEdit.date || ""}`,
                buttonText: "",
                tagline: liveEdit.status || "draft",
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
              id: "blog-body",
              title: "Article Body",
              type: "text",
              content: {
                heading: "",
                body: liveEdit.content || "Write the article body here. Click this section in the preview to edit the text.",
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
            const hero = sections.find((s) => s.id === "blog-hero");
            const body = sections.find((s) => s.id === "blog-body");
            if (hero?.content?.heading || body?.content?.body) {
              try {
                await updateContentBlog(liveEdit.id, {
                  title: hero?.content?.heading || liveEdit.title,
                  content: body?.content?.body,
                });
              } catch {
                // sections already persisted
              }
            }
          }}
          onClose={fetchBlog}
        />
      )}
    </PageShell>
  );
}