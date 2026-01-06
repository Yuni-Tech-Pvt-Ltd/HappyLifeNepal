"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          is_read: false,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We’ll get back to you as soon as possible.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative w-full min-h-screen py-16 bg-[url('https://media.istockphoto.com/id/1586911323/photo/close-up-of-african-woman-hands-holding-red-heart-in-solidarity.jpg?s=612x612&w=0&k=20&c=of0vz5Ddd-BPWrbUy1g51hzBD8qf842zwPj-7VR4cpU=')] bg-center bg-cover"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-white">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-orange-400 font-semibold mb-3 text-sm sm:text-base">
            📬 Get in Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Contact Us</h2>
          <p className="text-gray-200 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Have questions or want to support our cause? Fill out the form below
            and we’ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact Info */}
          <div className="flex flex-col justify-center gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold mb-1">Email</h3>
                <p className="text-gray-200">info@happylifenepal.org</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold mb-1">Phone</h3>
                <p className="text-gray-200">+977 986-9476794</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="text-xl font-semibold mb-1">Address</h3>
                <p className="text-gray-200">Kathmandu, Nepal</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-xl flex flex-col gap-4 text-gray-900"
          >
            <div>
              <label className="font-medium mb-1 block">Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="font-medium mb-1 block">Email</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Your Email"
              />
            </div>

            <div>
              <label className="font-medium mb-1 block">Subject</label>
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Subject (optional)"
              />
            </div>

            <div>
              <label className="font-medium mb-1 block">Message</label>
              <Textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Your Message"
              />
            </div>

            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-500 text-white font-semibold flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
