import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Event } from "@/types";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function EventsSection() {
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })
        .limit(4);

      if (error) throw error;
      return data as Event[];
    },
  });

  /* 🔴 Realtime updates */
  useEffect(() => {
    const channel = supabase
      .channel("events-home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => queryClient.invalidateQueries({ queryKey: ["events"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return {
      day: d.getDate(),
      month: d.toLocaleString("en-US", { month: "long" }),
    };
  };

  /* Stats (static like your design) */
  const stats = [
    { number: "260+", text: "Total Happy Children" },
    { number: "110+", text: "Total Our Volunteer" },
    { number: "190+", text: "Our Products & Gifts" },
    { number: "560+", text: "Worldwide Donor" },
  ];

  return (
    <section
      id="event"
      className="w-full bg-[#10141F] text-white py-20 px-4 sm:px-6 lg:px-20"
    >
      {/* 🔵 STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto mb-20 text-center">
        {stats.map((item, i) => (
          <div key={i} className="relative group">
            <div className="border border-[#2c3141] rounded-full h-36 w-36 flex flex-col items-center justify-center mx-auto hover:shadow-2xl transition">
              <span className="text-3xl font-bold text-orange-500">
                {item.number}
              </span>
              <span className="text-sm opacity-80 mt-1">{item.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 🔵 HEADING */}
      <div className="text-center mb-14">
        <p className="text-orange-500 font-semibold">Upcoming Events</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2">
          Charities Information Of <br /> Event Schedule
        </h2>
      </div>

      {/* 🔵 EVENTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {events.map((event) => {
          const { day, month } = formatDate(event.event_date);

          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-6 shadow-lg hover:scale-[1.03] transition"
            >
              {/* Image */}
              <div className="relative w-full sm:w-40 h-52 flex-shrink-0">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="rounded-xl w-full h-full object-cover"
                />

                {/* Date Badge */}
                <div className="absolute top-3 left-3 bg-white text-black rounded-md text-center px-3 py-1 text-sm font-bold shadow">
                  {day}
                  <br />
                  <span className="text-orange-500">{month}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-black text-xl mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {event.description}
                  </p>

                  <div className="h-px bg-gradient-to-r from-gray-400 to-transparent my-3" />

                  <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <Link
                  to={`/event/${event.id}`}
                  className="mt-5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold w-fit"
                >
                  Event Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔵 CTA */}
      <div className="text-center mt-14">
        <Link
          to="/events"
          className="inline-block bg-orange-500 px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 text-white shadow-lg"
        >
          Explore More
        </Link>
      </div>
    </section>
  );
}
