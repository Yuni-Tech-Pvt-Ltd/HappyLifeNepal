import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Clock, Share2, Users, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Event;
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied!',
      description: 'Share this event with others',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <Link to="/#events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/#events" className="inline-flex items-center text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Events
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={event.image_url || 'https://via.placeholder.com/1200x600'}
                alt={event.title}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                {event.is_featured && (
                  <div className="inline-flex items-center gap-2 bg-primary/90 backdrop-blur-md rounded-full px-4 py-2 mb-4">
                    <span className="text-white text-sm font-semibold">Featured Event</span>
                  </div>
                )}
                <div className={`inline-flex items-center gap-2 ${isUpcoming ? 'bg-green-500/90' : 'bg-gray-500/90'} backdrop-blur-md rounded-full px-4 py-2`}>
                  <span className="text-white text-sm font-semibold">
                    {isUpcoming ? 'Upcoming' : 'Past Event'}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                {event.title}
              </h1>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Date</div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(eventDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Time</div>
                    <div className="font-semibold text-gray-900">
                      {formatTime(eventDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Location</div>
                    <div className="font-semibold text-gray-900">
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>

            
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{formatDate(eventDate)}</div>
                      <div className="text-gray-500">{formatTime(eventDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{event.location}</div>
                      <div className="text-gray-500">{isUpcoming ? 'Upcoming' : 'Past Event'}</div>
                    </div>
                  </div>
                </div>
                <Button size="lg" className="w-full mb-4">
                  <Users className="mr-2 h-5 w-5" />
                  Attend Event
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={handleShare}>
                  <Share2 className="mr-2 h-5 w-5" />
                  Share Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
