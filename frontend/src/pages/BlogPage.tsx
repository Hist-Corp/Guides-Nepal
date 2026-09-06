import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCmsBlogPosts } from '../services/cms';

const staticBlogPosts = [
  {
    id: 1,
    title: '10 Hidden Gems in Kathmandu You Must Visit',
    excerpt: 'Discover the secret spots that only locals know about. From hidden temples to underground cafes.',
    author: 'Ram Bahadur',
    date: '2026-01-15',
    image: 'https://images.unsplash.com/photo-1589923188900-85688317b96e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Travel Tips'
  },
  {
    id: 2,
    title: 'A Foodie\'s Guide to Newari Cuisine',
    excerpt: 'Explore the rich flavors of traditional Newari dishes and where to find the best ones.',
    author: 'Priya Sharma',
    date: '2026-01-10',
    image: 'https://images.unsplash.com/photo-1604542052539-b8c13b852152?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Food & Culture'
  },
  {
    id: 3,
    title: 'Pokhara: Beyond the Tourist Trail',
    excerpt: 'Go beyond Phewa Lake and discover what makes Pokhara truly special.',
    author: 'Sujal Thapa',
    date: '2026-01-05',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Adventure'
  },
  {
    id: 4,
    title: 'Sustainable Travel in Nepal: A Complete Guide',
    excerpt: 'Learn how to travel responsibly and support local communities while exploring Nepal.',
    author: 'Rohan KC',
    date: '2025-12-28',
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Sustainability'
  },
  {
    id: 5,
    title: 'Bhaktapur: Walking Through Living History',
    excerpt: 'Experience the medieval charm of Bhaktapur and its preserved Newari architecture.',
    author: 'Apicha Maharjan',
    date: '2025-12-20',
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Culture'
  },
  {
    id: 6,
    title: 'How to Become a Local Guide in Nepal',
    excerpt: 'Interested in sharing your culture? Here\'s everything you need to know about becoming a guide.',
    author: 'Guides Nepal Team',
    date: '2025-12-15',
    image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Community'
  }
];

const BlogPage: React.FC = () => {
  const [cmsPosts, setCmsPosts] = useState<any[]>([]);

  useEffect(() => {
    getCmsBlogPosts().then(setCmsPosts);
  }, []);

  // Merge CMS-edited posts over the static defaults by id, so dashboard edits show live
  const blogPosts = staticBlogPosts.map((p) => {
    const cms = cmsPosts.find((c) => c.id === p.id);
    if (!cms) return p;
    return {
      ...p,
      title: cms.title || p.title,
      excerpt: cms.content ? cms.content.slice(0, 140) + (cms.content.length > 140 ? '…' : '') : p.excerpt,
      author: cms.author || p.author,
      date: cms.date || p.date,
    };
  }).concat(
    cmsPosts.filter((c) => !staticBlogPosts.some((p) => p.id === c.id))
      .map((c) => ({
        id: c.id,
        title: c.title,
        excerpt: (c.content || '').slice(0, 140),
        author: c.author || 'Guides Nepal Team',
        date: c.date || '',
        image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        category: 'Community',
      }))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">{post.category}</span>
                    <h2 className="font-bold text-lg mt-2 mb-2 text-slate-900 group-hover:text-primary transition-colors">{post.title}</h2>
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