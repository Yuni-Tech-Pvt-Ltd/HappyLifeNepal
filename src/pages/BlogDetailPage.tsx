import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Blog } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Share2, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BlogDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Blog;
    },
  });

  const { data: relatedBlogs = [] } = useQuery({
    queryKey: ['related-blogs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as Blog[];
    },
    enabled: !!blog,
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied!',
      description: 'Share this blog post with others',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h2>
          <Link to="/#blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/#blog" className="inline-flex items-center text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={blog.image_url || 'https://via.placeholder.com/1920x1080'}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-medium">{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(blog.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <Heart className="h-4 w-4" />
                    <span>Featured</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
              {/* Blog Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 leading-relaxed whitespace-pre-line">
                  {blog.content}
                </p>
              </div>

              
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Related Posts */}
              {relatedBlogs.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-4">Related Posts</h3>
                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link 
                        key={relatedBlog.id} 
                        to={`/blog/${relatedBlog.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <img
                            src={relatedBlog.image_url || 'https://via.placeholder.com/100'}
                            alt={relatedBlog.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                              {relatedBlog.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {formatDate(relatedBlog.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
