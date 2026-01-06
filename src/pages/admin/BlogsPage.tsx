import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import { Blog } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function BlogsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: blogs = [] } = useQuery({
    queryKey: ['blogs-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Blog[];
    },
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    is_published: true,
    image_url: ''
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let imageUrl = data.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `blog-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.BLOGS)
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKETS.BLOGS)
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (editingBlog) {
        const { error } = await supabase
          .from('blogs')
          .update({ ...data, image_url: imageUrl, updated_at: new Date().toISOString() })
          .eq('id', editingBlog.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([{ ...data, image_url: imageUrl }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs-admin'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({
        title: 'Success',
        description: editingBlog ? 'Blog updated' : 'Blog created',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save blog',
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs-admin'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({
        title: 'Success',
        description: 'Blog deleted',
      });
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBlog(null);
    setImageFile(null);
    setFormData({
      title: '',
      content: '',
      author: '',
      is_published: true,
      image_url: ''
    });
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      author: blog.author,
      is_published: blog.is_published,
      image_url: blog.image_url || ''
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Blogs Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Blog Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <label className="text-sm font-medium">Published</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Featured Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {(formData.image_url || imageFile) && (
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                      alt="Preview"
                      className="mt-2 w-full h-40 object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id}>
              <CardHeader>
                {blog.image_url && (
                  <img src={blog.image_url} alt={blog.title} className="w-full h-32 object-cover rounded mb-2" />
                )}
                <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{blog.content}</p>
                <p className="text-xs text-gray-500 mb-4">By {blog.author} • {blog.is_published ? 'Published' : 'Draft'}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(blog)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(blog.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
