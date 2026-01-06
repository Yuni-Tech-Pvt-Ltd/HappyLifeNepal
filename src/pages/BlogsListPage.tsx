import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Blog } from '@/types';
import { Calendar, User, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

export default function BlogsListPage() {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Blog[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('blogs-realtime-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blogs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['blogs-all'] });
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q)
    );
  }, [blogs, query]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <header className="pt-24 pb-10 bg-gradient-to-br from-purple-50 via-white to-pink-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">All Blog Posts</h1>
          <p className="text-gray-600 max-w-2xl">
            Read news, stories, and updates from HappyLifeNepal.
          </p>
          <div className="mt-6 relative max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blogs by title, author, or content..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </header>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No blog posts found</h2>
              <p className="text-gray-600">Try a different search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((blog) => (
                <article
                  key={blog.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={blog.image_url || 'https://via.placeholder.com/800x450'}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{formatDate(blog.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-primary" />
                        <span>{blog.author}</span>
                      </div>
                    </div>
                    <Link
                      to={`/blog/${blog.id}`}
                      className="block"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">{blog.content}</p>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
