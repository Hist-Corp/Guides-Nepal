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
} from 'lucide-react';
import { getCmsBlogPosts, type CmsBlogPost } from '../services/cms';
import { staticBlogPosts } from './BlogPage';
import { blogFullContent } from '../data/blogContent';

type BlogPost = (typeof staticBlogPosts)[number] & { content?: string };
type Block =
  | { kind: 'h2'; text: string; id: string }
  | { kind: 'h3'; text: string; id: string }
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'image'; alt: string; src: string; caption?: string };

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
  const flushP = () => {
    const t = para.join(' ').trim();
    if (t) blocks.push({ kind: 'p', text: t });
    para = [];
  };
  const flushL = () => {
    if (list.length) blocks.push({ kind: 'list', items: list });
    list = [];
  };
  for (const rl of lines) {
    const line = rl.trim();
    if (!line) {
      flushP();
      flushL();
      continue;
    }
    const m = line.match(/^!\[(.*?)\]\((\S+?)(?:\s+"(.*?)")?\)$/);
    if (m) {
      flushP();
      flushL();
      blocks.push({
        kind: 'image',
        alt: m[1] || 'Nepal travel photo',
        src: m[2],
        caption: m[3] || undefined,
      });
      continue;
    }
    if (line.startsWith('## ')) {
      flushP();
      flushL();
      const t = line.slice(3).trim();
      blocks.push({ kind: 'h2', text: t, id: slugifyHeading(t) });
      continue;
    }
    if (line.startsWith('### ')) {
      flushP();
      flushL();
      const t = line.slice(4).trim();
      blocks.push({ kind: 'h3', text: t, id: slugifyHeading(t) });
      continue;
    }
    if (line.startsWith('> ')) {
      flushP();
      flushL();
      blocks.push({ kind: 'quote', text: line.slice(2).trim() });
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
    para.push(line);
  }
  flushP();
  flushL();
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
                  content: cms.content || blogFullContent[slug] || staticPost.excerpt,
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

  const blocks = useMemo(() => parseContent(post?.content || ''), [post?.content]);
  const toc = useMemo(
    () => blocks.filter((b) => b.kind === 'h2') as { kind: 'h2'; text: string; id: string }[],
    [blocks]
  );
  const readingMins = useMemo(() => {
    const w = (post?.content || '').split(/\s+/).filter(Boolean).length;
    return Math.max(3, Math.round(w / 200));
  }, [post?.content]);

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
        <main className="flex-grow flex items-center justify-center bg-slate-50">
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
        <main className="flex-grow">
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
                className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all inline-block mt-8"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Blog
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
      <main className="flex-grow bg-white">
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
                    src={post.image}
                    alt={post.title}
                    className="w-full h-72 md:h-96 object-cover"
                    loading="eager"
                  />
                </figure>
                {toc.length > 0 && (
                  <nav
                    aria-label="Table of contents"
                    className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8"
                  >
                    <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-3">
                      In this guide
                    </h2>
                    <ol className="space-y-1.5 text-sm">
                      {toc.map((h) => (
                        <li key={h.id}>
                          <a href={`#${h.id}`} className="text-slate-600 hover:text-primary">
                            → {h.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
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
                            src={block.src}
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
                            src={p.image}
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
                className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all inline-block"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Blog
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
