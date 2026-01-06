import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Donation } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Share2, Calendar, TrendingUp, Target, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DonationDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: donation, isLoading } = useQuery({
    queryKey: ['donation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Donation;
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied!',
      description: 'Share this donation with others',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Donation not found</h2>
          <Link to="/#donate">
            <Button>Back to Donations</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = (donation.current_amount / donation.target_amount) * 100;
  const remainingAmount = donation.target_amount - donation.current_amount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/#donate" className="inline-flex items-center text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Donations
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
                src={donation.image_url || 'https://via.placeholder.com/1200x600'}
                alt={donation.title}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-4">
                  <Heart className="h-4 w-4 text-white fill-white" />
                  <span className="text-white text-sm font-semibold">
                    {donation.is_active ? 'Active Campaign' : 'Completed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {donation.title}
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                {donation.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-sm text-gray-600">Goal</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  NRS {donation.target_amount.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-gray-600">Raised</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  NRS {donation.current_amount.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Remaining</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  NRS {remainingAmount.toLocaleString()}
                </div>
              </div>
            </div>
 
          </div>

          {/* Sidebar - Donation Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-baseline mb-4">
                    <div>
                      <div className="text-4xl font-bold text-gray-900">
                        NRS {donation.current_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        raised of NRS {donation.target_amount.toLocaleString()} goal
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
                      <div className="text-xs text-gray-500">complete</div>
                    </div>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">NRS {remainingAmount.toLocaleString()}</span> still needed
                  </div>
                </div>

                <div className="mb-8 pb-8 border-b" />

                <div className="space-y-4 mb-6" />

                {/* Donate Button */}
                <Button size="lg" className="w-full mb-4">
                  <Heart className="mr-2 h-5 w-5 fill-white" />
                  Donate Now
                </Button>

                {/* Share Button */}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share Campaign
                </Button>

                <div className="mt-8 pt-8 border-t" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
