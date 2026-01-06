import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Donation } from '@/types';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Heart, Search } from 'lucide-react';

export default function DonationsListPage() {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['donations-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Donation[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('donations-realtime-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['donations-all'] });
        queryClient.invalidateQueries({ queryKey: ['donations'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return donations;
    return donations.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  }, [donations, query]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <header className="pt-24 pb-10 bg-gradient-to-br from-orange-50 via-white to-amber-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">All Donations</h1>
          <p className="text-gray-600 max-w-2xl">
            Explore all donation campaigns and contribute to make an impact.
          </p>
          <div className="mt-6 relative max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search donations by title or description..."
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No donations found</h2>
              <p className="text-gray-600">Try a different search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((donation) => {
                const progress = (donation.current_amount / donation.target_amount) * 100;
                return (
                  <Link
                    key={donation.id}
                    to={`/donation/${donation.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={donation.image_url || 'https://via.placeholder.com/800x450'}
                        alt={donation.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3 text-xs">
                        <Heart className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-primary font-semibold">
                          {donation.is_active ? 'Active' : 'Completed'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {donation.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">{donation.description}</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold text-primary">
                            NRS {donation.current_amount.toLocaleString()}
                          </span>
                          <span className="text-gray-500">
                            of NRS {donation.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
