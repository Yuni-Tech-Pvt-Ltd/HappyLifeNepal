import { Users, Heart, Gift, Globe } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    {
      icon: Users,
      number: '260+',
      label: 'Total Happy Children',
      color: 'text-orange-500'
    },
    {
      icon: Heart,
      number: '110+',
      label: 'Total Our Volunteer',
      color: 'text-red-500'
    },
    {
      icon: Gift,
      number: '190+',
      label: 'Our Products & Gifts',
      color: 'text-purple-500'
    },
    {
      icon: Globe,
      number: '560+',
      label: 'Worldwide Donor',
      color: 'text-blue-500'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`${stat.color} mb-4`}>
                <stat.icon className="h-12 w-12" strokeWidth={1.5} />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
