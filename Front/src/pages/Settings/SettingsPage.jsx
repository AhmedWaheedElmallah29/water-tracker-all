import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserProfile } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useApi } from "../../hooks/useApi";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export default function SettingsPage() {
  const api = useApi();
  const [todayData, setTodayData] = useState(null);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClerkProfile, setShowClerkProfile] = useState(false);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await api.get("/api/water/today");
        setTodayData(res.data);
        setNewGoal(String(res.data.goal || 3));
      } catch (err) {
        console.error("Error fetching today:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateGoal = async () => {
    if (!newGoal || parseFloat(newGoal) <= 0) {
      toast.error("Please enter a valid goal");
      return;
    }
    try {
      const res = await api.put("/api/water/goal", { goal: parseFloat(newGoal) });
      setTodayData(res.data);
      toast.success(`Daily goal set to ${newGoal}L 🎯`);
    } catch {
      toast.error("Failed to update goal");
    }
  };

  const resetDay = async () => {
    try {
      const res = await api.post("/api/water/reset");
      setTodayData(res.data.waterEntry);
      setShowResetConfirm(false);
      toast.success("Today's progress has been reset");
    } catch {
      toast.error("Failed to reset");
      setShowResetConfirm(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="max-w-2xl mx-auto px-4 py-6 md:px-8"
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Settings ⚙️</h1>
        <p className="text-white/40 text-sm mt-1">Manage your hydration preferences</p>
      </div>

      <div className="flex flex-col gap-5">

        {/* ── Daily Goal Card ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 border border-blue-400/25 rounded-xl flex items-center justify-center text-xl">
              🎯
            </div>
            <div>
              <h2 className="text-white font-semibold">Daily Hydration Goal</h2>
              <p className="text-white/40 text-xs">
                Current: {loading ? "…" : `${todayData?.goal || 3}L`}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                min={0.5}
                max={10}
                step={0.5}
                className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/15 rounded-xl text-white outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">L</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={updateGoal}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(96,165,250,0.25)] transition-all"
            >
              Save
            </motion.button>
          </div>

          {/* Quick goal presets */}
          <div className="flex gap-2 mt-3">
            {[1.5, 2, 2.5, 3, 3.5, 4].map((preset) => (
              <button
                key={preset}
                onClick={() => setNewGoal(String(preset))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  parseFloat(newGoal) === preset
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {preset}L
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Danger Zone ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 border border-red-400/25 rounded-xl flex items-center justify-center text-xl">
              ⚠️
            </div>
            <div>
              <h2 className="text-white font-semibold">Danger Zone</h2>
              <p className="text-white/40 text-xs">Irreversible actions</p>
            </div>
          </div>

          {!showResetConfirm ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-400/25 rounded-xl text-red-400 font-semibold transition-all"
            >
              🔄 Reset Today&apos;s Progress
            </motion.button>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-400/25 rounded-xl">
              <p className="text-red-300 text-sm font-medium mb-3 text-center">
                Are you sure? This will delete all water logs for today.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 font-medium text-sm">
                  Cancel
                </button>
                <button onClick={resetDay}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 rounded-xl text-white font-bold text-sm transition-colors">
                  Yes, Reset
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Account Card ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-400/25 rounded-xl flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <h2 className="text-white font-semibold">Account</h2>
              <p className="text-white/40 text-xs">Manage your profile and security</p>
            </div>
          </div>

          <button
            onClick={() => setShowClerkProfile(!showClerkProfile)}
            className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/25 rounded-xl text-purple-300 font-semibold transition-all"
          >
            {showClerkProfile ? "Hide Profile Settings" : "Open Profile Settings"}
          </button>

          {showClerkProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="mt-4 overflow-hidden rounded-2xl"
            >
              <UserProfile
                appearance={{
                  variables: {
                    colorBackground: "rgba(15, 23, 42, 0.95)",
                    colorText: "#ffffff",
                    colorPrimary: "#3b82f6",
                    borderRadius: "12px",
                  },
                }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* ── App Info ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.16 } }}
          className="text-center p-4"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-lg">💧</span>
            <span className="text-white/50 font-semibold text-sm">HydroTrack</span>
          </div>
          <p className="text-white/25 text-xs">Stay hydrated, stay healthy.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
