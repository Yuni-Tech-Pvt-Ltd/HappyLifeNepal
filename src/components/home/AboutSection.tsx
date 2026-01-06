import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AboutUs } from "@/types";

export default function AboutSection() {
  const { data: aboutData } = useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_us")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as AboutUs | null;
    },
  });

  const defaultContent = {
    title: "About Us",
    content:
      "We are committed to making a positive impact in the community through education, health, and sustainable development initiatives.",
    mission:
      "Empowering communities, providing essential resources, and fostering sustainable growth.",
    image_url: "/gallery2.jpg",
  };

  const content = aboutData || defaultContent;

  return (
    <section id="about" className="w-full bg-gray-50 py-20 px-6 lg:px-20">
      {/* Heading */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-orange-600 mb-4">
          {content.title}
        </h2>
        <p className="text-gray-600 font-bold max-w-2xl mx-auto">
          {content.content}
        </p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* Image */}
        <div className="lg:w-1/2 w-full relative group">
          <div className="absolute -top-6 -left-6 w-40 h-40 bg-orange-200 rounded-full opacity-40 mix-blend-multiply animate-pulse"></div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-blue-200 rounded-full opacity-40 mix-blend-multiply animate-pulse"></div>

          <img
            src={content.image_url}
            alt="About us"
            className="w-full h-[690px] object-cover rounded-4xl shadow-xl transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>

        {/* Content */}
        <div className="lg:w-1/2 w-full">
          <h3 className="text-2xl font-semibold text-orange-800 mb-4">
            Our Mission
          </h3>
          <p className="text-gray-600 mb-8">{content.mission}</p>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "Education",
                text: "Providing access to quality education for underprivileged children.",
                color: "bg-yellow-100",
              },
              {
                title: "Healthcare",
                text: "Ensuring essential healthcare services reach those in need.",
                color: "bg-green-100",
              },
              {
                title: "Community Support",
                text: "Empowering local communities through training and resources.",
                color: "bg-purple-100",
              },
              {
                title: "Sustainability",
                text: "Promoting environmentally responsible practices for lasting impact.",
                color: "bg-blue-100",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`${item.color} p-5 rounded-2xl shadow-lg transition-transform hover:scale-105 hover:shadow-2xl`}
              >
                <h4 className="font-semibold text-gray-800 mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
