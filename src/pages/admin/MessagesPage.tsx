import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ContactMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MessagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      toast({
        title: 'Success',
        description: 'Message deleted',
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <Badge variant="secondary">
            {messages.filter(m => !m.is_read).length} Unread
          </Badge>
        </div>

        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={message.is_read ? 'opacity-75' : 'border-primary/50'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{message.name}</CardTitle>
                      {!message.is_read && <Badge>New</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{message.email}</p>
                    {message.subject && (
                      <p className="text-sm text-gray-500 mt-1">Subject: {message.subject}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{formatDate(message.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    {!message.is_read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReadMutation.mutate(message.id)}
                      >
                        <MailOpen className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(message.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
              </CardContent>
            </Card>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No messages yet</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
