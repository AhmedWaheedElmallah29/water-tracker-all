import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTint } from "react-icons/fa";
import { UserButton, useUser } from "@clerk/clerk-react";

/**
 * Navbar — Desktop top navigation.
 * Hidden on mobile (< md). BottomNav handles mobile navigation.
 */
export default function Navbar() {
  const { user } = useUser();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "💧" },
    { to: "/history", label: "History", icon: "📊" },
    { to: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 px-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(96,165,250,0.4)]">
            <FaTint className="text-white text-base" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            HydroTrack
          </span>
        </button>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-white/50 text-sm hidden lg:block">
              {user.firstName || user.emailAddresses[0]?.emailAddress}
            </span>
          )}
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-9 h-9 ring-2 ring-blue-400/30 ring-offset-2 ring-offset-transparent",
              },
            }}
          />
        </div>
      </motion.div>
    </header>
  );
}
