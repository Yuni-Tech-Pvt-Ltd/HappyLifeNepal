import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import { AboutUs } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save } from 'lucide-react';

export default function AboutPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: aboutData } = useQuery({
    queryKey: ['about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_us')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as AboutUs | null;
    },
  });

  const [formData, setFormData] = useState({
    title: aboutData?.title || 'About HappyLifeNepal',
    content: aboutData?.content || '',
    mission: aboutData?.mission || '',
    vision: aboutData?.vision || '',
    image_url: aboutData?.image_url || ''
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let imageUrl = data.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `about-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.ABOUT)
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKETS.ABOUT)
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (aboutData) {
        const { error } = await supabase
          .from('about_us')
          .update({ ...data, image_url: imageUrl, updated_at: new Date().toISOString() })
          .eq('id', aboutData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('about_us')
          .insert([{ ...data, image_url: imageUrl }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
      toast({
        title: 'Success',
        description: 'About Us page updated successfully',
      });
      setImageFile(null);
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update About Us page',
        variant: 'destructive'
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Us Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>Edit About Us Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Content
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Statement
                </label>
                <Textarea
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vision Statement
                </label>
                <Textarea
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                {(formData.image_url || imageFile) && (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                    alt="Preview"
                    className="mt-4 w-full max-w-md h-48 object-cover rounded-lg"
                  />
                )}
              </div>

              <Button type="submit" disabled={saveMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
