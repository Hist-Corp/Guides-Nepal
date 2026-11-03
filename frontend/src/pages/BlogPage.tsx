import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageBackButton } from '../components/common/PageBackButton';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCmsBlogPosts } from '../services/cms';

function readingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// eslint-disable-next-line react-refresh/only-export-components
export const staticBlogPosts = [
  {
    id: 1,
    slug: 'hidden-gems-kathmandu',
    title: '10 Hidden Gems in Kathmandu You Must Visit',
    excerpt:
      'Discover the secret spots that only locals know about. From hidden temples to underground cafes.',
    author: 'Ram Bahadur',
    date: '2026-01-15',
    image:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    category: 'Travel Tips',
    status: 'published',
  },
  {
    id: 2,
    slug: 'foodie-guide-newari-cuisine',
    title: "A Foodie's Guide to Newari Cuisine",
    excerpt:
      'Explore the rich flavors of traditional Newari dishes and where to find the best ones.',
    author: 'Priya Sharma',
    date: '2026-01-10',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    category: 'Food & Culture',
    status: 'published',
  },
  {
    id: 3,
    slug: 'pokhara-beyond-tourist-trail',
    title: 'Pokhara: Beyond the Tourist Trail',
    excerpt: 'Go beyond Phewa Lake and discover what makes Pokhara truly special.',
    author: 'Sujal Thapa',
    date: '2026-01-05',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    category: 'Adventure',
    status: 'published',
  },
  {
    id: 4,
    slug: 'sustainable-travel-nepal-guide',
    title: 'Sustainable Travel in Nepal: A Complete Guide',
    excerpt: 'Learn how to travel responsibly and support local communities while exploring Nepal.',
    author: 'Rohan KC',
    date: '2025-12-28',
    image:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    category: 'Sustainability',
    status: 'published',
  },
  {
    id: 5,
    slug: 'bhaktapur-walking-living-history',
    title: 'Bhaktapur: Walking Through Living History',
    excerpt: 'Experience the medieval charm of Bhaktapur and its preserved Newari architecture.',
    author: 'Apicha Maharjan',
    date: '2025-12-20',
    image:
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=800&q=80',
    category: 'Culture',
    status: 'published',
  },
  {
    id: 6,
    slug: 'how-to-become-local-guide-nepal',
    title: 'How to Become a Local Guide in Nepal',
    excerpt:
      "Interested in sharing your culture? Here's everything you need to know about becoming a guide.",
    author: 'Guides Nepal Team',
    date: '2025-12-15',
    image:
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    category: 'Community',
    status: 'published',
  },
  {
    id: 7,
    slug: 'bardiya-national-park',
    title: 'Bardiya National Park: Tiger Safari Guide to Nepal (2026)',
    excerpt:
      'Nepal’s premier tiger-viewing destination — 112 Royal Bengal tigers across 968 sq km of lowland wilderness, walking safaris, and far fewer visitors than Chitwan.',
    author: 'Krishna Prasad Bhatta',
    date: '2026-10-15',
    image:
      'https://www.magicalnepal.com/wp-content/uploads/2026/10/view-from-the-bardiya-national-park.jpg',
    category: 'Wildlife',
    status: 'published',
  },
];

const BlogPage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cmsPosts, setCmsPosts] = useState<any[]>([]);

  useEffect(() => {
    getCmsBlogPosts().then(setCmsPosts);
  }, []);

  // Merge CMS posts over the static defaults by slug (ids are backend-local
  // and must never be assumed to line up with the frontend list). A CMS
  // post with status != "published" is hidden from the public page;
  // dashboard staff still see it in their own table.
  const blogPosts = staticBlogPosts
    .map((p) => {
      const cms = cmsPosts.find((c) => c.slug === p.slug);
      if (!cms) return p;
      if ((cms.status || 'published').toLowerCase() !== 'published') return null;
      return {
        ...p,
        title: cms.title || p.title,
        excerpt:
          cms.excerpt ||
          (cms.content
            ? cms.content.replace(/[#>*![\]()]/g, '').slice(0, 140) +
              (cms.content.length > 140 ? '…' : '')
            : p.excerpt),
        author: cms.author || p.author,
        date: cms.date || p.date,
        category: cms.category || p.category,
        image: cms.image || cms.featuredImage || p.image,
        status: cms.status || p.status,
      };
    })
    .filter((p): p is (typeof staticBlogPosts)[number] => p !== null)
    .concat(
      cmsPosts
        .filter(
          (c) =>
            (c.status || 'published').toLowerCase() === 'published' &&
            !staticBlogPosts.some((p) => p.slug === c.slug)
        )
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          excerpt: c.excerpt || (c.content || '').replace(/[#>*![\]()]/g, '').slice(0, 140),
          author: c.author || 'Guides Nepal Team',
          date: c.date || '',
          image:
            c.image ||
            c.featuredImage ||
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
          category: c.category || 'Community',
          status: c.status || 'published',
        }))
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageBackButton label="Back to Blog" />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Stories, tips, and insights from our community of local guides.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="block"
                >
                  <article
                    className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#213448]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span
                        className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs font-bold text-primary uppercase tracking-wider shadow-sm border border-slate-100"
                      >
                        {post.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className="flex items-center gap-1 text-xs text-slate-400"
                        >
                          <User className="w-3 h-3" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {readingTime(post.excerpt)} min read
                        </span>
                      </div>
                      <h2
                        className="font-bold text-lg mt-1 mb-2 text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight"
                      >
                        {post.title}
                      </h2>
                      <p className="text-slate-500 text-sm mb-5 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-wide">
                        Read story
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
