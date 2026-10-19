import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageBackButton } from '../components/common/PageBackButton';
import { Clock, User, ArrowLeft } from 'lucide-react';
import { getCmsBlogPosts, type CmsBlogPost } from '../services/cms';
import { staticBlogPosts } from './BlogPage';
import { blogFullContent } from '../data/blogContent';

type BlogPost = (typeof staticBlogPosts)[number] & { content?: string };

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const staticPost = staticBlogPosts.find((p) => p.slug === slug);
    if (!staticPost) {
      setLoading(false);
      setPost(null);
      return;
    }

    getCmsBlogPosts()
      .then((cmsPosts) => {
        const cms: CmsBlogPost | undefined = cmsPosts.find((c) => c.slug === slug);
        if (cms && (cms.status || 'published').toLowerCase() !== 'published') {
          setPost(null);
        } else {
          setPost({
            ...staticPost,
            ...(cms
              ? {
                  title: cms.title || staticPost.title,
                  content: blogFullContent[slug] || cms.content || '',
                  author: cms.author || staticPost.author,
                  date: cms.date || staticPost.date,
                  category: cms.category || staticPost.category,
                  image: cms.image || staticPost.image,
                }
              : {
                  content: blogFullContent[slug] || '',
                }),
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setPost({ ...staticPost, content: blogFullContent[slug] || '' });
      });
  }, [slug]);

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

  const paragraphs = (post.content || '').split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageBackButton />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 mt-2 text-slate-900">
              {post.title}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">{post.excerpt}</p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <article className="lg:w-2/3">
                <div className="h-64 overflow-hidden rounded-xl mb-6">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-700 leading-relaxed">
                  {paragraphs.map((para, i) => (
                    <p key={i} className="mb-6">
                      {para}
                    </p>
                  ))}
                </div>
              </article>

              <aside className="lg:w-1/3 space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Related Reading</h3>
                  {staticBlogPosts
                    .filter((p) => p.slug !== post.slug)
                    .slice(0, 3)
                    .map((p) => (
                      <Link key={p.slug} to={`/blog/${p.slug}`} className="block mb-4">
                        <h4 className="font-bold text-slate-900 mb-1 text-sm">{p.title}</h4>
                        <p className="text-xs text-slate-500">{p.excerpt}</p>
                      </Link>
                    ))}
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
