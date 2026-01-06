import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Home", link: "/" },
    { name: "About", link: "#about" },
    { name: "Events", link: "#events" },
    { name: "Blog", link: "#blog" },
    { name: "Contact", link: "#contact" },
  ];

  // Get user from supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };

  return (
    <nav
      className={`
        w-full py-5 px-4 sm:px-10 lg:px-20 flex justify-between items-center fixed top-0 left-0 z-50
        backdrop-blur-md border-b transition-colors duration-300
        ${
          scrolled
            ? "bg-white/90 text-gray-900 border-gray-200"
            : "bg-white/10 text-white border-white/10"
        }
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img
          src="../logo.png"
          alt="Logo"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-xl font-bold">
          Happy Life <span></span>Nepal
        </h1>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden lg:flex items-center space-x-8 text-sm font-medium">
        {menuItems.map((item) => (
          <li key={item.name} className="hover:text-orange-400 transition">
            <a href={item.link}>{item.name}</a>
          </li>
        ))}
      </ul>

      {/* Desktop Auth Button */}
      <div className="hidden lg:flex items-center gap-4">
        {!user ? (
          <button
            onClick={() => navigate("/auth/login")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-orange-500/30"
          >
            Login
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-red-500/30"
          >
            Logout
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0D1117]/95 backdrop-blur-md flex flex-col items-center py-6 space-y-4 lg:hidden border-t border-white/10">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              className="text-white hover:text-orange-400 text-lg"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}

          {!user ? (
            <button
              onClick={() => navigate("/auth/login")}
              className="bg-orange-500 text-white px-6 py-2 rounded-full"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-full"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
