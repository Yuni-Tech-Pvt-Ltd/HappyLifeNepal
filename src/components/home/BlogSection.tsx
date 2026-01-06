"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Blog } from "@/types";
import { Calendar, User, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function BlogSection() {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { data: blogs = [] } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Blog[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("blogs-realtime-home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blogs" },
        () => queryClient.invalidateQueries({ queryKey: ["blogs"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -350 : 350,
      behavior: "smooth",
    });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return {
      day: d.getDate(),
      month: d.toLocaleString("en-US", { month: "short" }),
    };
  };

  return (
    <section id="blog" className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT SECTION */}
        <div className="flex flex-col justify-center">
          <p className="text-orange-600 font-semibold flex items-center gap-2 mb-2">
            ❤️ Latest Blog
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Read Our Latest News
          </h2>

          <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-md">
            We help companies develop powerful corporate social responsibility,
            grantmaking, and employee engagement strategies.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-gray-100"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BLOG SCROLLER */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar pb-3"
        >
          {blogs.map((blog) => {
            const { day, month } = formatDate(blog.created_at);

            return (
              <Link
                key={blog.id}
                to={`/blog/${blog.id}`}
                className="min-w-[260px] sm:min-w-[320px] lg:min-w-[420px]"
              >
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden h-full">
                  <div className="relative">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                    />

                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-lg text-center">
                      <p className="text-lg font-bold leading-5">{day}</p>
                      <p className="text-xs">{month}</p>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center border-b pb-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-orange-500" />
                        {blog.author || "Admin"}
                      </div>

                      <div className="mx-3 w-px h-4 bg-gray-300" />

                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4 text-orange-500" />
                        Blog
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-3 hover:text-orange-500 line-clamp-2">
                      {blog.title}
                    </h3>

                    <span className="text-sm text-orange-600 font-semibold flex items-center gap-1">
                      Read More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
