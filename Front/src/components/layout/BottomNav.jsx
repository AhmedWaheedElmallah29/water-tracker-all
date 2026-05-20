import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  {
    to: "/dashboard",
    label: "Home",
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
        />
      </svg>
    ),
  },
  {
    to: "/history",
    label: "History",
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

/**
 * BottomNav — Mobile-only bottom tab navigation.
 * Fixed to the bottom of the screen, hidden on md+ (desktop uses Navbar).
 */
export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10 px-2 pt-2 pb-safe">
        <div className="flex justify-around items-center max-w-sm mx-auto">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className="flex-1">
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-colors duration-200"
                >
                  {/* Active indicator pill */}
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-pill"
                      className="absolute w-10 h-1 bg-blue-400 rounded-full -top-0.5 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  <span
                    className={`transition-colors duration-200 ${
                      isActive ? "text-blue-400" : "text-white/40"
                    }`}
                  >
                    {tab.icon(isActive)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                      isActive ? "text-blue-400" : "text-white/40"
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
