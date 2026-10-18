import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageBackButton } from '../components/common/PageBackButton';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCmsBlogPosts } from '../services/cms';
import { useImagePlacement } from '../hooks/useCms';

const staticBlogPosts = [
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
];

const BlogPage: React.FC = () => {
  const [cmsPosts, setCmsPosts] = useState<any[]>([]);
  // Dashboard-placed blog post images (slots blog-post-1 .. blog-post-6)
  const placedImages = Array.from({ length: 6 }, (_, i) => useImagePlacement(`blog-post-${i + 1}`));

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
        excerpt: cms.content
          ? cms.content.slice(0, 140) + (cms.content.length > 140 ? '…' : '')
          : p.excerpt,
        author: cms.author || p.author,
        date: cms.date || p.date,
        category: cms.category || p.category,
        image: cms.image || p.image,
        status: cms.status || p.status,
      };
    })
    .filter((p): p is typeof staticBlogPosts[number] => p !== null)
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
          excerpt: (c.content || '').slice(0, 140),
          author: c.author || 'Guides Nepal Team',
          date: c.date || '',
          image:
            c.image ||
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
          category: c.category || 'Community',
          status: c.status || 'published',
        }))
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageBackButton />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={placedImages[index] || post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">
                      {post.category}
                    </span>
                    <h2 className="font-bold text-lg mt-2 mb-2 text-slate-900 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                    </div>
                    <button className="mt-4 text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
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
