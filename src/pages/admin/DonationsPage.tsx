import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import { Donation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function DonationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: donations = [] } = useQuery({
    queryKey: ['donations-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Donation[];
    },
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: 0,
    current_amount: 0,
    is_active: true,
    image_url: ''
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let imageUrl = data.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `donation-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.DONATIONS)
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKETS.DONATIONS)
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (editingDonation) {
        const { error } = await supabase
          .from('donations')
          .update({ ...data, image_url: imageUrl, updated_at: new Date().toISOString() })
          .eq('id', editingDonation.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('donations')
          .insert([{ ...data, image_url: imageUrl }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      toast({
        title: 'Success',
        description: editingDonation ? 'Donation updated' : 'Donation created',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save donation',
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('donations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      toast({
        title: 'Success',
        description: 'Donation deleted',
      });
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDonation(null);
    setImageFile(null);
    setFormData({
      title: '',
      description: '',
      target_amount: 0,
      current_amount: 0,
      is_active: true,
      image_url: ''
    });
  };

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation);
    setFormData({
      title: donation.title,
      description: donation.description,
      target_amount: donation.target_amount,
      current_amount: donation.current_amount,
      is_active: donation.is_active,
      image_url: donation.image_url || ''
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Donations Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Donation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDonation ? 'Edit Donation' : 'Add New Donation'}</DialogTitle>
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
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Amount (NRS)</label>
                    <Input
                      type="number"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Amount (NRS)</label>
                    <Input
                      type="number"
                      value={formData.current_amount}
                      onChange={(e) => setFormData({ ...formData, current_amount: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {(formData.image_url || imageFile) && (
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                      alt="Preview"
                      className="mt-2 w-full h-32 object-cover rounded"
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
          {donations.map((donation) => (
            <Card key={donation.id}>
              <CardHeader>
                {donation.image_url && (
                  <img src={donation.image_url} alt={donation.title} className="w-full h-32 object-cover rounded mb-2" />
                )}
                <CardTitle className="text-lg">{donation.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{donation.description}</p>
                <div className="text-sm mb-2">
                  <span className="font-semibold">NRS {donation.current_amount}</span> / NRS {donation.target_amount}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(donation)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(donation.id)}>
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
