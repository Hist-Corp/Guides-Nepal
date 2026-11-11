import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageBackButton } from '../components/common/PageBackButton';
import {
  User,
  ArrowLeft,
  Calendar,
  Tag,
  BookOpen,
  Lightbulb,
  MapPin,
  Share2,
  CheckCircle2,
  Quote,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { getCmsBlogPosts, type CmsBlogPost } from '../services/cms';
import { staticBlogPosts } from './BlogPage';
import { blogFullContent } from '../data/blogContent';

type BlogPost = (typeof staticBlogPosts)[number] & { content?: string };
type FactRow = { label: string; value: string };
type AuthorBio = { name: string; role: string; bio: string };
type Block =
  | { kind: 'h2'; text: string; id: string }
  | { kind: 'h3'; text: string; id: string }
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'image'; alt: string; src: string; caption?: string }
  | { kind: 'key-takeaways'; items: string[] }
  | { kind: 'fact-table'; rows: FactRow[] }
  | { kind: 'author-bio'; bios: AuthorBio[] }
  | { kind: 'faq'; question: string; answer: string };

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function parseContent(raw: string): Block[] {
  const lines = raw.split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let tableRows: FactRow[] = [];
  let inTable = false;
  let keyTakeaways: string[] = [];
  let inKeyTakeaways = false;
  let authorBios: AuthorBio[] = [];
  let currentBio: Partial<AuthorBio> | null = null;
  let inAuthorBio = false;

  const flushP = () => {
    const t = para.join(' ').trim();
    if (t) blocks.push({ kind: 'p', text: t });
    para = [];
  };
  const flushL = () => {
    if (list.length) blocks.push({ kind: 'list', items: list });
    list = [];
  };
  const flushTable = () => {
    if (tableRows.length) {
      blocks.push({ kind: 'fact-table', rows: tableRows });
      tableRows = [];
    }
    inTable = false;
  };
  const flushKeyTakeaways = () => {
    if (keyTakeaways.length) {
      blocks.push({ kind: 'key-takeaways', items: keyTakeaways });
      keyTakeaways = [];
    }
    inKeyTakeaways = false;
  };
  const flushAuthorBio = () => {
    if (currentBio && (currentBio.name || currentBio.bio)) {
      authorBios.push({
        name: currentBio.name || '',
        role: currentBio.role || '',
        bio: currentBio.bio || '',
      });
    }
    currentBio = null;
    inAuthorBio = false;
    if (authorBios.length) {
      blocks.push({ kind: 'author-bio', bios: authorBios });
      authorBios = [];
    }
  };

  for (const rl of lines) {
    const line = rl.trim();
    if (!line) {
      flushP();
      flushL();
      flushTable();
      flushKeyTakeaways();
      flushAuthorBio();
      continue;
    }
    const m = line.match(/^!\[(.*?)\]\((\S+?)(?:\s+"(.*?)")?\)$/);
    if (m) {
      flushP();
      flushL();
      flushTable();
      flushKeyTakeaways();
      flushAuthorBio();
      blocks.push({
        kind: 'image',
        alt: m[1] || 'Nepal travel photo',
        src: m[2],
        caption: m[3] || undefined,
      });
      continue;
    }
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      const headingText = headingMatch[1].trim();
      const lower = headingText.toLowerCase();
      flushP();
      flushL();
      flushTable();
      flushKeyTakeaways();
      flushAuthorBio();
      if (lower === 'key takeaways') {
        inKeyTakeaways = true;
        continue;
      }
      if (lower === 'fact table') {
        inTable = true;
        continue;
      }
      if (lower === 'about the author') {
        inAuthorBio = true;
        continue;
      }
      if (lower === 'frequently asked questions') {
        blocks.push({ kind: 'h2', text: headingText, id: slugifyHeading(headingText) });
        continue;
      }
      blocks.push({ kind: 'h2', text: headingText, id: slugifyHeading(headingText) });
      continue;
    }
    if (line.startsWith('### ')) {
      flushP();
      flushL();
      flushTable();
      flushKeyTakeaways();
      flushAuthorBio();
      const t = line.slice(4).trim();
      blocks.push({ kind: 'h3', text: t, id: slugifyHeading(t) });
      continue;
    }
    if (inKeyTakeaways && /^[-*]\s+/.test(line)) {
      keyTakeaways.push(line.replace(/^[-*]\s+/, '').trim());
      continue;
    }
    if (inTable && line.includes('|') && !line.startsWith('|---')) {
      const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        tableRows.push({ label: cells[0], value: cells.slice(1).join(' | ') });
      }
      continue;
    }
    if (inAuthorBio) {
      const nameMatch = line.match(/^\*\*(.+?)\*\*\s*—\s*(.+)$/);
      if (nameMatch) {
        if (currentBio && (currentBio.name || currentBio.bio)) {
          authorBios.push({
            name: currentBio.name || '',
            role: currentBio.role || '',
            bio: currentBio.bio || '',
          });
        }
        currentBio = { name: nameMatch[1].trim(), role: nameMatch[2].trim(), bio: '' };
        continue;
      }
      if (currentBio && !currentBio.bio) {
        currentBio.bio = line;
        continue;
      }
      if (!currentBio) {
        currentBio = { name: '', role: '', bio: line };
        continue;
      }
    }
    if (/^\*\*.+\*\*$/.test(line) && !inAuthorBio && !inTable && !inKeyTakeaways) {
      flushP();
      flushL();
      flushTable();
      flushKeyTakeaways();
      flushAuthorBio();
      const question = line.replace(/\*\*/g, '').trim();
      blocks.push({ kind: 'faq', question, answer: '' });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushP();
      list.push(line.replace(/^[-*]\s+/, '').trim());
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      flushP();
      list.push(line.replace(/^\d+\.\s+/, '').trim());
      continue;
    }
    if (
      !inAuthorBio &&
      !inTable &&
      !inKeyTakeaways &&
      blocks.length > 0 &&
      blocks[blocks.length - 1].kind === 'faq' &&
      (blocks[blocks.length - 1] as { kind: 'faq'; answer: string }).answer === ''
    ) {
      const last = blocks[blocks.length - 1] as { kind: 'faq'; answer: string };
      last.answer = line;
      continue;
    }
    para.push(line);
  }
  flushP();
  flushL();
  flushTable();
  flushKeyTakeaways();
  flushAuthorBio();
  return blocks;
}

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!slug) {
      setLoading(false);
      return;
    }

    const staticPost = staticBlogPosts.find((p) => p.slug === slug);

    getCmsBlogPosts()
      .then((cmsPosts) => {
        const cms: CmsBlogPost | undefined = cmsPosts.find((c) => c.slug === slug);
        if (!staticPost && !cms) {
          setLoading(false);
          setPost(null);
          return;
        }
        if (cms && (cms.status || 'published').toLowerCase() !== 'published') {
          setPost(null);
        } else if (staticPost) {
          setPost({
            ...staticPost,
            ...(cms
              ? {
                  title: cms.title || staticPost.title,
                  excerpt: cms.excerpt || staticPost.excerpt,
                  content: blogFullContent[slug] || cms.content || staticPost.excerpt,
                  author: cms.author || staticPost.author,
                  date: cms.date || staticPost.date,
                  category: cms.category || staticPost.category,
                  image: cms.image || cms.featuredImage || staticPost.image,
                }
              : {
                  content: blogFullContent[slug] || '',
                }),
          });
        } else if (cms) {
          setPost({
            id: cms.id,
            slug: cms.slug,
            title: cms.title,
            excerpt: cms.excerpt || (cms.content || '').replace(/[#>*![\]()]/g, '').slice(0, 140),
            content: cms.content || '',
            author: cms.author || 'Guides Nepal Team',
            date: cms.date || new Date().toISOString().slice(0, 10),
            image:
              cms.image ||
              cms.featuredImage ||
              'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
            category: cms.category || 'Community',
            status: cms.status || 'published',
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        if (staticPost) setPost({ ...staticPost, content: blogFullContent[slug!] || '' });
        else setPost(null);
      });
  }, [slug]);

  const sanitizeImageUrl = (src: string | undefined): string => {
    const FALLBACK = '/placeholder.png';
    if (!src || typeof src !== 'string') return FALLBACK;
    if (/^https?:\/\/[\w.-]+(:\d+)?(\/[\w./%?=&#:+-]*)?$/.test(src)) return src;
    if (/^\/[\w./%?=&#:+-]*$/.test(src)) return src;
    return FALLBACK;
  };
  const safeImage = sanitizeImageUrl(post?.image);
  const blocks = useMemo(() => parseContent(post?.content || ''), [post?.content]);
  const toc = useMemo(
    () => blocks.filter((b) => b.kind === 'h2') as { kind: 'h2'; text: string; id: string }[],
    [blocks]
  );
  const readingMins = useMemo(() => {
    const w = (post?.content || '').split(/\s+/).filter(Boolean).length;
    return Math.max(3, Math.round(w / 200));
  }, [post?.content]);

  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // Scroll spy: track which heading is currently in view
  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) setActiveHeadingId(id);
          }
        }
      },
      { rootMargin: '-100px 0% -70% 0%', threshold: 0 }
    );
    toc.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  const handleShare = async () => {
    if (!post) return;
    try {
      if (navigator.share)
        await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
    } catch {
      /* dismissed */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-grow flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-grow">
          <section className="bg-primary py-20 text-white">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Post Not Found</h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                The article you are looking for does not exist or is not published yet.
              </p>
            </div>
          </section>
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 text-center">
              <Link
    to="/blog"
    className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full"
  >
    <ArrowLeft className="w-4 h-4" />
    Back to Blog
  </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageBackButton />
      <main id="main-content" className="flex-grow bg-white">
        <section className="bg-gradient-to-b from-[#213448] to-[#2c4a63] py-14 text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-4">
              <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <Tag className="w-3 h-3" /> {post.category}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <BookOpen className="w-3 h-3" /> {readingMins} min read
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">{post.title}</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">{post.excerpt}</p>
            <div className="flex items-center justify-center gap-5 mt-6 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />{' '}
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-white">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <article className="lg:w-2/3">
                <figure className="rounded-2xl overflow-hidden mb-8 shadow-sm border border-slate-100">
                  <img
                    src={safeImage}
                    alt={post.title}
                    className="w-full h-72 md:h-96 object-cover"
                    loading="eager"
                  />
                </figure>
                <div className="text-slate-700 leading-relaxed text-[1.05rem]">
                  {blocks.map((block, i) => {
                    if (block.kind === 'h2')
                      return (
                        <h2
                          key={i}
                          id={block.id}
                          className="text-2xl font-extrabold text-slate-900 mt-10 mb-4 scroll-mt-24"
                        >
                          {block.text}
                        </h2>
                      );
                    if (block.kind === 'h3')
                      return (
                        <h3
                          key={i}
                          id={block.id}
                          className="text-xl font-bold text-slate-900 mt-8 mb-3 scroll-mt-24"
                        >
                          {block.text}
                        </h3>
                      );
                    if (block.kind === 'key-takeaways')
                      return (
                        <section key={i} className="my-8 rounded-2xl bg-[#FDF8F5] border border-[#DCE5ED] p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
                              Key Takeaways
                            </h3>
                          </div>
                          <ul className="space-y-3">
                            {block.items.map((item, j) => (
                              <li key={j} className="flex items-start gap-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <p className="text-slate-700 text-[0.95rem] leading-relaxed">
                                  {renderInline(item)}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </section>
                      );
                    if (block.kind === 'fact-table')
                      return (
                        <div key={i} className="my-8 rounded-xl border border-slate-200/80 shadow-lg shadow-slate-900/5 overflow-hidden bg-white transition-all duration-200 hover:shadow-md">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-gradient-to-r from-primary via-[#213448] to-[#1a2a3a] text-white">
                                <tr>
                                  <th className="px-4 py-3 font-bold text-sm tracking-wide text-white/90">Label</th>
                                  <th className="px-4 py-3 font-bold text-sm tracking-wide text-white/90">Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {block.rows.map((row, j) => (
                                  <tr key={j} className="transition-colors duration-150 group hover:bg-white/50">
                                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                                      {row.label}
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-600">{row.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    if (block.kind === 'author-bio')
                      return (
                        <section key={i} className="my-10 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                            <div className="md:col-span-4 bg-[#213448] p-6 flex flex-col justify-center">
                              <div className="flex flex-col items-center text-white">
                                <h3 className="font-bold text-lg mb-1">
                                  {block.bios.map((b) => b.name).join(' & ')}
                                </h3>
                                <p className="text-primary/30 text-xs font-medium uppercase tracking-widest mb-3">
                                  {block.bios.map((b) => b.role).join(' / ')}
                                </p>
                              </div>
                            </div>
                            <div className="md:col-span-8 p-6">
                              <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-widest">
                                About the Author
                              </h4>
                              <div className="space-y-3">
                                {block.bios.map((bio, bi) => (
                                  <div key={bi} className="text-slate-700 leading-relaxed text-[0.98rem]">
                                    {renderInline(bio.bio)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </section>
                      );
                    if (block.kind === 'faq')
                      return (
                        <div key={i} className="mb-6 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                          <p className="font-bold text-slate-900 text-[0.98rem] mb-1">{block.question}</p>
                          <p className="text-slate-600 text-[0.95rem] leading-relaxed">{block.answer}</p>
                        </div>
                      );
                    if (block.kind === 'quote')
                      return (
                        <aside
                          key={i}
                          className="my-7 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-5 flex gap-3"
                        >
                          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-slate-800 text-[0.98rem]">
                            {renderInline(block.text)}
                          </p>
                        </aside>
                      );
                    if (block.kind === 'image')
                      return (
                        <figure
                          key={i}
                          className="my-8 rounded-2xl overflow-hidden border border-slate-200 bg-white"
                        >
                          <img
                            src={sanitizeImageUrl(block.src)}
                            alt={block.alt}
                            className="w-full h-64 md:h-80 object-cover"
                            loading="lazy"
                          />
                          <figcaption className="px-4 py-3 text-xs text-slate-500 flex items-start gap-1.5 bg-slate-50">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                            <span>{block.caption || block.alt}</span>
                          </figcaption>
                        </figure>
                      );
                    if (block.kind === 'list')
                      return (
                        <ul key={i} className="my-5 space-y-2.5">
                          {block.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{renderInline(item)}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    return (
                      <p key={i} className="mb-5">
                        {renderInline(block.text)}
                      </p>
                    );
                  })}
                </div>
              </article>

              <aside className="lg:w-1/3 space-y-6 lg:sticky lg:top-24 self-start w-full">
                {toc.length > 0 && (
                  <nav
                    aria-label="Table of contents"
                    className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-xl shadow-slate-900/6 backdrop-blur-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h2 className="text-xs font-bold tracking-widest text-slate-800 uppercase flex items-center gap-2">
                          Guide Contents
                        </h2>
                      </div>
                      <span className="text-[10px] font-medium tracking-wider text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-full">
                        {toc.length} sections
                      </span>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-amber-500/60 rounded-l-xl pointer-events-none" />
                      <ol className="space-y-1">
                        {toc.map((h, idx) => {
                          const isActive = activeHeadingId === h.id;
                          return (
                            <li key={h.id}>
                              <a
                                href={`#${encodeURIComponent(h.id)}`}
                                onClick={() => {
                                  const el = document.getElementById(h.id);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }}
                                className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 relative ${isActive
                                    ? 'bg-gradient-to-r from-primary/10 to-[#213448]/5 border border-primary/20 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:border-slate-200/80 hover:text-slate-900 hover:pl-2.5 hover:shadow-sm'
                                }`}
                              >
                                <span className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-br from-primary to-[#213448] text-white'
                                    : 'bg-slate-100/80 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className="flex-1 leading-snug tracking-tight text-sm text-black">
                                  {h.text}
                                </span>
                                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-all duration-200 group-hover:translate-x-1 ${isActive ? 'rotate-90 text-black' : 'text-slate-400 group-hover:text-slate-600'}`} />
                              </a>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </nav>
                )}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-1">Related Reading</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Keep exploring Nepal with our guides.
                  </p>
                  {staticBlogPosts
                    .filter((p) => p.slug !== post.slug)
                    .slice(0, 3)
                    .map((p) => (
                      <Link key={p.slug} to={`/blog/${p.slug}`} className="block mb-4 group">
                        <div className="flex gap-3">
                          <img
                            src={sanitizeImageUrl(p.image)}
                            alt={p.title}
                            className="w-20 h-16 rounded-lg object-cover shrink-0"
                            loading="lazy"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-primary">
                              {p.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.excerpt}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
                <div className="bg-[#213448] text-white p-6 rounded-2xl">
                  <h3 className="font-bold mb-1">Explore with a local guide</h3>
                  <p className="text-sm text-white/70 mb-4">
                    Book a verified host for the places in this story.
                  </p>
                  <Link
                    to="/guides"
                    className="inline-block bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-amber-300"
                  >
                    Find your guide
                  </Link>
                </div>
              </aside>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 text-center">
              <Link
    to="/blog"
    className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full"
  >
    <ArrowLeft className="w-4 h-4" />
    Back to Blog
  </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailPage;
