import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Donation } from "@/types";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function DonationSection() {
  const { data: donations = [] } = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("donations")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      return (data || []) as Donation[];
    },
  });

  const defaultDonations: Donation[] = [
    {
      id: "1",
      title: "Education for Children",
      description: "Help provide books and school supplies.",
      target_amount: 5000,
      current_amount: 3200,
      image_url:
        "https://images.lifestyleasia.com/wp-content/uploads/sites/7/2020/04/22155743/Optimized-GettyImages-467143466.jpg",
      is_active: true,
      created_at: "",
      updated_at: "",
    },
    {
      id: "2",
      title: "Healthcare Support",
      description: "Provide essential healthcare services.",
      target_amount: 3000,
      current_amount: 2100,
      image_url: "https://miro.medium.com/v2/1*M7uNg2mEmFke_qQ8RjlhQg.jpeg",
      is_active: true,
      created_at: "",
      updated_at: "",
    },
  ];

  const items = donations.length ? donations : defaultDonations;

  /* ---------------- DRAG + AUTOSCROLL ---------------- */
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    scrollLeft.current = containerRef.current!.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const walk = startX.current - e.pageX;
    containerRef.current!.scrollLeft = scrollLeft.current + walk;
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  // Auto scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (!isDragging.current) {
        el.scrollLeft += 1;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
          el.scrollLeft = 0;
        }
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-orange-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
        <p className="text-orange-500 text-center font-semibold mb-3">
          Help & Donate Us
        </p>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
          Inspiring and Helping for Better Lifestyle
        </h2>

        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseLeave={stopDrag}
          onMouseUp={stopDrag}
          className="no-scrollbar whitespace-nowrap overflow-x-auto cursor-grab active:cursor-grabbing"
        >
          {items.map((donation) => (
            <Link
              key={donation.id}
              to={`/donation/${donation.id}`}
              className="inline-block w-[260px] bg-white rounded-2xl shadow-lg
                         overflow-hidden mr-6 hover:scale-105 transition-transform"
            >
              <div className="h-44 overflow-hidden">
                <img
                  src={donation.image_url}
                  alt={donation.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {donation.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {donation.description}
                </p>

                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white
                                   font-semibold px-4 py-2 rounded-full"
                >
                  Donate Now
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
