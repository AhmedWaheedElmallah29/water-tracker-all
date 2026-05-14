import { motion } from "framer-motion";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const features = [
  {
    icon: "💧",
    title: "Track Every Drop",
    desc: "Log water intake in seconds with preset bottle sizes or a custom amount. Every sip counts.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-400/20",
  },
  {
    icon: "🎯",
    title: "Set Your Goals",
    desc: "Personalize your daily hydration target based on your weight, activity level, and climate.",
    gradient: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-400/20",
  },
  {
    icon: "📊",
    title: "Weekly Insights",
    desc: "Visualize your 7-day hydration history with beautiful charts. Build your streak and earn stars.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-400/20",
  },
  {
    icon: "🔥",
    title: "Build Streaks",
    desc: "Stay motivated with a daily streak counter. Hit your goal every day to keep the fire burning.",
    gradient: "from-orange-500/20 to-red-500/20",
    border: "border-orange-400/20",
  },
  {
    icon: "📵",
    title: "Works Offline",
    desc: "Log water even without internet. Entries sync automatically when you reconnect.",
    gradient: "from-slate-500/20 to-gray-500/20",
    border: "border-slate-400/20",
  },
  {
    icon: "🔔",
    title: "Smart Reminders",
    desc: "Hydration reminders throughout your day so you never forget to drink water again.",
    gradient: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-400/20",
  },
];

const steps = [
  { step: "01", title: "Create your account", desc: "Sign up in seconds — no credit card needed.", icon: "👤" },
  { step: "02", title: "Set your daily goal", desc: "Tell us how much water you want to drink each day.", icon: "🎯" },
  { step: "03", title: "Log your intake", desc: "Tap a quick-add button every time you drink.", icon: "💧" },
  { step: "04", title: "Watch your progress", desc: "See your streak grow and history fill with stars.", icon: "🏆" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

export default function Landing() {
  return (
    <>
      {/* If already signed in, redirect to dashboard */}
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen relative overflow-x-hidden">

          {/* ── Navbar ────────────────────────────────────────────── */}
          <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-sm">💧</span>
                </div>
                <span className="text-white font-bold text-lg">HydroTrack</span>
              </div>
              <div className="flex gap-3">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </div>
          </nav>

          {/* ── Hero Section ──────────────────────────────────────── */}
          <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
            {/* Decorative blobs */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] -z-10" />

            {/* Animated water drop */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-[80px] md:text-[100px] mb-6 select-none"
              style={{ filter: "drop-shadow(0 0 30px rgba(96,165,250,0.5))" }}
            >
              💧
            </motion.div>

            {/* Badge */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-300 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Your Personal Hydration Coach
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 max-w-4xl"
            >
              Stay Hydrated,{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                Stay Healthy
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-lg md:text-xl text-white/60 max-w-xl mb-10 leading-relaxed"
            >
              Track your daily water intake, build hydration streaks, and reach
              your goals — all in one beautiful, fast app.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-lg rounded-2xl shadow-[0_0_30px_rgba(96,165,250,0.4)] transition-all duration-200"
                >
                  🚀 Start Free — No Credit Card
                </motion.button>
              </SignUpButton>
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-lg rounded-2xl border border-white/15 transition-all duration-200"
                >
                  Sign In
                </motion.button>
              </SignInButton>
            </motion.div>

            {/* Social proof */}
            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="mt-8 text-white/30 text-sm"
            >
              🌊 Join thousands of people building healthy hydration habits
            </motion.p>

            {/* Scroll indicator */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-2xl"
            >
              ↓
            </motion.div>
          </section>

          {/* ── Features Section ──────────────────────────────────── */}
          <section className="py-20 px-6 relative">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="text-center mb-14"
              >
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Everything You Need to{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Stay Hydrated
                  </span>
                </h2>
                <p className="text-white/50 text-lg max-w-xl mx-auto">
                  Simple, powerful tools designed to make healthy habits effortless.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`p-6 bg-gradient-to-br ${f.gradient} backdrop-blur-xl rounded-2xl border ${f.border} relative overflow-hidden group`}
                  >
                    <div className="text-3xl mb-3">{f.icon}</div>
                    <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── How It Works ──────────────────────────────────────── */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-14"
              >
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Up and Running in{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    60 Seconds
                  </span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {steps.map((s, i) => (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 border border-blue-400/30 rounded-xl flex items-center justify-center text-xl">
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-blue-400 text-xs font-bold tracking-widest mb-1">
                        STEP {s.step}
                      </div>
                      <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                      <p className="text-white/50 text-sm">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA Banner ────────────────────────────────────────── */}
          <section className="py-20 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center p-10 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-3xl border border-blue-400/20 backdrop-blur-xl"
            >
              <div className="text-5xl mb-4">💧</div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Ready to start your journey?
              </h2>
              <p className="text-white/55 mb-8">
                It&apos;s free, it&apos;s fast, and your body will thank you.
              </p>
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-[0_0_30px_rgba(96,165,250,0.35)] transition-all"
                >
                  Get Started Free →
                </motion.button>
              </SignUpButton>
            </motion.div>
          </section>

          {/* ── Footer ────────────────────────────────────────────── */}
          <footer className="py-8 px-6 text-center border-t border-white/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">💧</span>
              <span className="text-white font-semibold">HydroTrack</span>
            </div>
            <p className="text-white/25 text-sm">
              © {new Date().getFullYear()} HydroTrack. Built with ❤️ for healthy hydration.
            </p>
          </footer>
        </div>
      </SignedOut>
    </>
  );
}
