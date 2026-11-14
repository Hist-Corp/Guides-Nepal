import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import PageShell from '../components/PageShell';
import Table, { Column } from '../components/Table';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import Field from '../components/Field';
import { statusVariant } from '../utils/statusVariant';
import {
  getContentBlog,
  createContentBlog,
  updateContentBlog,
  deleteContentBlog,
} from '../services/api';
import ImagePicker from '../components/ImagePicker';
import BackButton from '../components/BackButton';
import { uploadMedia } from '../services/api';
import { compressImage, fetchImageAsFile, generatePreview } from '../utils/imageCompressor';
import LivePageEditor, { type Section } from './LivePageEditor';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  author?: string;
  date?: string;
  status?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  image?: string;
  featuredImage?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build the LivePageEditor section tree for a blog post so the editor opens
 * filled in — mirrors how the Pages section seeds the live editor.
 */
function buildBlogSections(post: BlogPost): Section[] {
  return [
    {
      id: 'blog-hero',
      label: 'Post Header',
      type: 'hero',
      content: {
        heading: post.title,
        subtitle: post.excerpt || '',
        buttonText: '',
        tagline: '',
        image: post.featuredImage || post.image || '',
      },
      style: {
        backgroundColor: '#213448',
        textColor: '#ffffff',
        accentColor: '#F4B400',
        alignment: 'left',
        headingSize: '2.5rem',
        padding: '3rem',
      },
    },
    {
      id: 'blog-body',
      label: 'Article Body',
      type: 'text',
      content: {
        heading: '',
        subtitle: '',
        body: post.content || '',
      },
      style: {
        backgroundColor: '#ffffff',
        textColor: '#213448',
        alignment: 'left',
        padding: '2.5rem',
      },
    },
    {
      id: 'blog-meta',
      label: 'Post Details',
      type: 'meta',
      content: {
        author: post.author || '',
        date: (post.date || '').slice(0, 10),
        category: post.category || '',
        status: post.status || 'draft',
      },
      style: {
        backgroundColor: '#ffffff',
        textColor: '#213448',
        alignment: 'left',
        padding: '2.5rem',
      },
    },
  ];
}

export default function WriterBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [liveEdit, setLiveEdit] = useState<BlogPost | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    author: '',
    date: '',
    excerpt: '',
    content: '',
    category: '',
    status: 'draft',
    featuredImage: '',
  });

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const data = await getContentBlog();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      slug: '',
      author: '',
      date: '',
      excerpt: '',
      content: '',
      category: '',
      status: 'draft',
      featuredImage: '',
    });
    setFeaturedImageFile(null);
    setFeaturedImagePreview('');
  };

  const resolveFeaturedImage = async (): Promise<string> => {
    if (featuredImageFile) {
      setUploadingImage(true);
      try {
        const compressed = await compressImage(featuredImageFile);
        const result = await uploadMedia(compressed.file);
        return result?.url || form.featuredImage;
      } finally {
        setUploadingImage(false);
      }
    }
    return form.featuredImage;
  };

  const formToPayload = (featuredImage: string) => ({
    title: form.title,
    slug: form.slug || slugify(form.title),
    author: form.author || undefined,
    date: form.date || undefined,
    excerpt: form.excerpt || undefined,
    content: form.content || undefined,
    category: form.category || undefined,
    status: form.status,
    image: featuredImage || undefined,
    featuredImage: featuredImage || undefined,
  });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setActionLoading(-1);
    try {
      const imageUrl = await resolveFeaturedImage();
      await createContentBlog(formToPayload(imageUrl));
      setOpenCreate(false);
      resetForm();
      fetchBlog();
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Failed to create article');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (postId: number) => {
    setActionLoading(postId);
    try {
      await updateContentBlog(postId, { status: 'published' });
      fetchBlog();
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Failed to publish article');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    setActionLoading(postId);
    try {
      await deleteContentBlog(postId);
      fetchBlog();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    } finally {
      setActionLoading(null);
    }
  };

  const visiblePosts =
    statusFilter === 'all'
      ? posts
      : posts.filter((p) => (p.status || 'draft').toLowerCase() === statusFilter);

  const columns: Column<BlogPost>[] = [
    {
      key: 'featuredImage',
      label: 'Image',
      render: (r) =>
        r.featuredImage || r.image ? (
          <img src={r.featuredImage || r.image} alt="" className="w-12 h-8 object-cover rounded" />
        ) : (
          <span className="text-xs text-gray-400">None</span>
        ),
    },
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'author',
      label: 'Author',
      render: (r) => <span className="text-sm text-gray-600">{r.author || '—'}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      render: (r) => <span className="text-sm text-gray-500">{r.date || '—'}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (r) => <span className="text-sm text-gray-600">{r.category || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={statusVariant(r.status)} size="sm">
          {r.status || 'draft'}
        </Badge>
      ),
    },
    {
      key: 'visible',
      label: 'On frontend',
      render: (r) =>
        (r.status || 'draft').toLowerCase() === 'published' ? (
          <Badge variant="success" size="sm">
            Live
          </Badge>
        ) : (
          <Badge variant="default" size="sm">
            Hidden
          </Badge>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setLiveEdit(r)}>
            Edit
          </Button>
          {(r.status || 'draft') !== 'published' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePublish(r.id)}
              disabled={actionLoading === r.id}
            >
              Publish
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(r.id)}
            disabled={actionLoading === r.id}
          >
            {actionLoading === r.id ? 'Removing…' : 'Remove'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <BackButton to="/dashboard/content-manager" />
      </div>
      <PageShell
        title="Blog"
        description="Manage your blog articles. Add, edit and publish editorial content in the live editor."
        action={
          <div className="flex items-center gap-1.5">
            <div className="flex rounded-full border border-gray-200 bg-white/80 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${viewMode === 'list' ? 'bg-darkBlue text-white' : 'text-gray-500 hover:text-darkBlue'}`}
              >
                ☰ List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${viewMode === 'cards' ? 'bg-darkBlue text-white' : 'text-gray-500 hover:text-darkBlue'}`}
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
              Write article
            </Button>
          </div>
        }
      >
        {loading ? (
          <Loading label="Loading articles…" />
        ) : viewMode === 'list' ? (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm">
              <span className="text-gray-500">Show:</span>
              {(['all', 'published', 'draft'] as const).map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'all' ? `All (${posts.length})` : s[0].toUpperCase() + s.slice(1)}
                </Button>
              ))}
              <span className="ml-2 text-xs text-gray-400">
                Only “published” articles appear on the frontend blog page.
              </span>
            </div>
            <Table
              columns={columns}
              rows={visiblePosts}
              emptyMessage="No articles found. Start by writing your first article."
            />
          </>
        ) : visiblePosts.length === 0 ? (
          <div className="text-sm text-gray-500 py-10 text-center">
            No articles found. Start by writing your first article.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visiblePosts.map((p) => (
              <div
                key={p.id}
                className="gn-card rounded-2xl border border-gray-200/70 overflow-hidden flex flex-col"
              >
                {p.featuredImage || p.image ? (
                  <img
                    src={p.featuredImage || p.image}
                    alt=""
                    className="h-28 w-full object-cover"
                  />
                ) : (
                  <div className="h-28 w-full bg-gradient-to-br from-darkBlue to-[#3a5a78] grid place-items-center text-3xl">
                    📝
                  </div>
                )}
                <div className="p-3.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <h3 className="font-bold text-darkBlue truncate flex-1">{p.title}</h3>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">/{p.slug}</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Badge variant={statusVariant(p.status)} size="sm">
                      {p.status || 'draft'}
                    </Badge>
                    {p.category && <span className="text-xs text-gray-500">{p.category}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 border-t border-gray-200/70 pt-2 pb-1.5 px-3.5">
                  <Button variant="ghost" size="sm" onClick={() => setLiveEdit(p)}>
                    Edit
                  </Button>
                  {(p.status || 'draft') !== 'published' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePublish(p.id)}
                      disabled={actionLoading === p.id}
                    >
                      Publish
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    disabled={actionLoading === p.id}
                  >
                    {actionLoading === p.id ? 'Removing…' : 'Remove'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          open={openCreate}
          title="New Article — every field"
          onClose={() => setOpenCreate(false)}
          wide
        >
          <div className="space-y-4">
            <Field
              label="Article Title"
              placeholder="Enter article title"
              value={form.title}
              onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setForm({ ...form, title: e.target.value })
              }
            />
            <Field
              label="Slug (optional)"
              placeholder="auto-generated"
              value={form.slug}
              onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setForm({ ...form, slug: e.target.value })
              }
            />
            <Field
              label="Publish date"
              type="date"
              value={form.date}
              onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setForm({ ...form, date: e.target.value })
              }
            />
            <Field
              label="Excerpt — shows on the blog listing card"
              as="textarea"
              rows={2}
              placeholder="One or two sentences shown under the title on /blog"
              value={form.excerpt}
              onChange={(
                e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
              ) => setForm({ ...form, excerpt: e.target.value })}
            />
            <Field
              label="Body — full article shown on the detail page"
              as="textarea"
              rows={12}
              className="font-mono !text-[13px] leading-relaxed"
              placeholder={
                '## Section heading\n\nWrite paragraphs here.\n\n> Tip callout\n\n- Bullet point\n\n![Alt](https://... "Caption")'
              }
              value={form.content}
              onChange={(
                e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
              ) => setForm({ ...form, content: e.target.value })}
            />
            <Field
              label="Author"
              placeholder="Author name"
              value={form.author}
              onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setForm({ ...form, author: e.target.value })
              }
            />
            <Field
              label="Category"
              placeholder="e.g. Travel Tips"
              value={form.category}
              onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setForm({ ...form, category: e.target.value })
              }
            />
            <Field
              label="Status"
              as="select"
              value={form.status}
              onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="draft">Draft — hidden from frontend</option>
              <option value="published">Published — live on frontend</option>
            </Field>
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
                  setFeaturedImagePreview('');
                  setForm({ ...form, featuredImage: '' });
                }}
              />
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleCreate}
              disabled={!form.title.trim() || actionLoading === -1 || uploadingImage}
            >
              {actionLoading === -1
                ? 'Adding…'
                : form.status === 'published'
                  ? 'Publish Article'
                  : 'Save Draft'}
            </Button>
          </div>
        </Modal>

        {liveEdit && (
          <LivePageEditor
            slug={liveEdit.slug}
            title={liveEdit.title}
            path={`/blog/${liveEdit.slug}`}
            backLabel="blog"
            initialSections={buildBlogSections(liveEdit)}
            onSaved={async (sections) => {
              const hero = sections.find((s) => s.id === 'blog-hero');
              const body = sections.find((s) => s.id === 'blog-body');
              const meta = sections.find((s) => s.id === 'blog-meta');
              const payload: Record<string, unknown> = {};
              const currentImage = liveEdit.featuredImage || liveEdit.image || '';

              if (hero) {
                const heading = String(hero.content.heading || '').trim();
                if (heading) payload.title = heading;
                if (typeof hero.content.subtitle === 'string' && hero.content.subtitle) {
                  payload.excerpt = hero.content.subtitle;
                }

                const rawImage = String(hero.content.image || '');
                if (rawImage && rawImage !== currentImage) {
                  if (/^https?:\/\//i.test(rawImage)) {
                    payload.image = rawImage;
                    payload.featuredImage = rawImage;
                  } else if (rawImage.startsWith('data:image/')) {
                    // The editor's upload tab hands back a base64 data URL —
                    // compress and upload it so the record stores a real URL.
                    try {
                      const file = await fetchImageAsFile(rawImage, 'blog-featured');
                      const compressed = await compressImage(file);
                      const uploaded = await uploadMedia(compressed.file);
                      if (uploaded?.url) {
                        payload.image = uploaded.url;
                        payload.featuredImage = uploaded.url;
                      }
                    } catch (error) {
                      console.error('Error uploading featured image:', error);
                    }
                  }
                }
              }

              if (body?.content?.body) {
                payload.content = body.content.body;
              }

              if (meta) {
                if (meta.content.author) payload.author = meta.content.author;
                if (meta.content.date) payload.date = meta.content.date;
                if (meta.content.category) payload.category = meta.content.category;
                const nextStatus = String(meta.content.status || '').toLowerCase();
                if (nextStatus === 'draft' || nextStatus === 'published') {
                  payload.status = nextStatus;
                }
              }

              if (Object.keys(payload).length > 0) {
                try {
                  await updateContentBlog(liveEdit.id, payload);
                } catch (error) {
                  console.error('Error updating article:', error);
                }
              }
            }}
            onClose={() => {
              setLiveEdit(null);
              fetchBlog();
            }}
          />
        )}
      </PageShell>
    </>
  );
}
