import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Gift, MessageSquare, Calendar, TrendingUp, Activity } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [donations, activeDonations, events, blogs, publishedBlogs, messages, unreadMessages] = await Promise.all([
        supabase.from('donations').select('*', { count: 'exact', head: true }),
        supabase.from('donations').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
      ]);

      return {
        totalDonations: donations.count || 0,
        activeDonations: activeDonations.count || 0,
        totalEvents: events.count || 0,
        totalBlogs: blogs.count || 0,
        publishedBlogs: publishedBlogs.count || 0,
        totalMessages: messages.count || 0,
        unreadMessages: unreadMessages.count || 0
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const contentStats = [
    { 
      icon: Gift, 
      label: 'Donations', 
      value: stats?.totalDonations || 0, 
      subValue: `${stats?.activeDonations || 0} active`,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      ring: 'ring-emerald-100'
    },
    { 
      icon: Calendar, 
      label: 'Events', 
      value: stats?.totalEvents || 0,
      subValue: 'scheduled',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      ring: 'ring-blue-100'
    },
    { 
      icon: MessageSquare, 
      label: 'Blog Posts', 
      value: stats?.totalBlogs || 0,
      subValue: `${stats?.publishedBlogs || 0} published`,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      ring: 'ring-purple-100'
    },
    { 
      icon: Activity, 
      label: 'Messages', 
      value: stats?.totalMessages || 0,
      subValue: `${stats?.unreadMessages || 0} unread`,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',
      ring: 'ring-orange-100',
      highlight: (stats?.unreadMessages || 0) > 0
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-orange-50 to-primary/5 rounded-2xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-orange-600 rounded-xl shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                  Dashboard Overview
                </h1>
                <p className="text-gray-600 text-lg">Monitor and manage your content at a glance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentStats.map((stat, index) => (
            <Card 
              key={index} 
              className={`
                relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 
                hover:-translate-y-2 group cursor-pointer bg-gradient-to-br ${stat.bgGradient}
                ${stat.highlight ? 'ring-2 ring-offset-2 ' + stat.ring + ' animate-pulse' : ''}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative p-6">
                {/* Icon Section */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 ${stat.iconBg} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                  {stat.highlight && (
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-red-600">New</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {stat.label}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                  {stat.subValue && (
                    <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      {stat.subValue}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-white/50">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">Activity</span>
                    <span className="font-semibold">Live</span>
                  </div>
                  <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min((stat.value / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Stats Summary */}
        <Card className="bg-gradient-to-br from-gray-50 to-white border-0 shadow-xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-orange-600 rounded-full"></div>
              Performance Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md border border-gray-100">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Content</p>
                  <p className="text-2xl font-bold text-gray-900">{(stats?.activeDonations || 0) + (stats?.publishedBlogs || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md border border-gray-100">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Content</p>
                  <p className="text-2xl font-bold text-gray-900">{(stats?.totalDonations || 0) + (stats?.totalBlogs || 0) + (stats?.totalEvents || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md border border-gray-100">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.unreadMessages || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
