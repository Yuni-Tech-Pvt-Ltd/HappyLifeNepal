import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function EventsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: events = [] } = useQuery({
    queryKey: ['events-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      
      if (error) throw error;
      return data as Event[];
    },
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    is_featured: false,
    image_url: ''
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let imageUrl = data.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `event-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.EVENTS)
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKETS.EVENTS)
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update({ ...data, image_url: imageUrl, updated_at: new Date().toISOString() })
          .eq('id', editingEvent.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert([{ ...data, image_url: imageUrl }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Success',
        description: editingEvent ? 'Event updated' : 'Event created',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save event',
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Success',
        description: 'Event deleted',
      });
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setImageFile(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      location: '',
      is_featured: false,
      image_url: ''
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_date: event.event_date.split('T')[0] + 'T' + event.event_date.split('T')[1].substring(0, 5),
      location: event.location,
      is_featured: event.is_featured,
      image_url: event.image_url || ''
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
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
                    <label className="block text-sm font-medium mb-2">Event Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <label className="text-sm font-medium">Featured Event</label>
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
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} className="w-full h-32 object-cover rounded mb-2" />
                )}
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                <p className="text-sm mb-1"><span className="font-semibold">Date:</span> {new Date(event.event_date).toLocaleString()}</p>
                <p className="text-sm mb-4"><span className="font-semibold">Location:</span> {event.location}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(event.id)}>
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
