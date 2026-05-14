import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useApi } from "../../hooks/useApi";
import WeeklyChart from "../../components/ui/WeeklyChart";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export default function HistoryPage() {
  const api = useApi();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEntry, setEditEntry] = useState(null);
  const [editAmount, setEditAmount] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get("/api/water/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching history:", err);
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (entry) => {
    setEditEntry(entry);
    setEditAmount(entry.amount);
  };

  const handleUpdate = async () => {
    if (!editEntry) return;
    try {
      await api.put(`/api/water/update-by-id/${editEntry._id}`, {
        amount: parseInt(editAmount),
      });
      setHistory((prev) =>
        prev.map((h) => (h._id === editEntry._id ? { ...h, amount: parseInt(editAmount) } : h))
      );
      setEditEntry(null);
      toast.success("Entry updated! ✅");
    } catch {
      toast.error("Failed to update entry");
    }
  };

  // Summary stats
  const totalDays = history.length;
  const goalMetDays = history.filter((h) => h.amount >= h.goal * 1000).length;
  const avgIntake =
    totalDays > 0
      ? (history.reduce((sum, h) => sum + h.amount, 0) / totalDays / 1000).toFixed(1)
      : 0;
  const bestDay = history.reduce(
    (best, h) => (h.amount > (best?.amount || 0) ? h : best),
    null
  );

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="max-w-3xl mx-auto px-4 py-6 md:px-8"
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Water History 📊</h1>
        <p className="text-white/40 text-sm mt-1">Your last 7 days at a glance</p>
      </div>

      {/* ── Weekly Chart Card ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10 mb-5"
      >
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 opacity-70">
          Weekly Progress
        </h2>
        {loading ? (
          <div className="h-36 flex items-center justify-center text-white/30 text-sm">Loading…</div>
        ) : (
          <WeeklyChart history={history} />
        )}
      </motion.div>

      {/* ── Stats Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Days Tracked", value: totalDays, color: "text-blue-400", icon: "📅" },
          { label: "Goals Met", value: goalMetDays, color: "text-emerald-400", icon: "⭐" },
          { label: "Avg / Day", value: `${avgIntake}L`, color: "text-purple-400", icon: "📊" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-white/40 text-xs">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Best day banner */}
      {bestDay && (
        <motion.div
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl mb-5"
        >
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-emerald-300 font-semibold text-sm">Personal Best</div>
            <div className="text-white/50 text-xs">
              {(bestDay.amount / 1000).toFixed(1)}L on{" "}
              {new Date(bestDay.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── History List ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10"
      >
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 opacity-70">
          Daily Log
        </h2>
        {loading ? (
          <div className="text-center text-white/30 py-8">Loading history…</div>
        ) : history.length === 0 ? (
          <div className="text-center text-white/30 py-8">
            <div className="text-4xl mb-3">💧</div>
            <p className="text-sm">No data yet. Start logging water!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[...history]
              .filter((e) => new Date(e.date) <= new Date())
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((entry, i) => {
                const pct = Math.min((entry.amount / (entry.goal * 1000)) * 100, 100);
                const goalMet = entry.amount >= entry.goal * 1000;
                return (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "long", month: "short", day: "numeric",
                          })}
                        </div>
                        <div className="text-white/40 text-xs mt-0.5">
                          {(entry.amount / 1000).toFixed(2)}L / {entry.goal}L goal
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {goalMet && <span className="text-lg">⭐</span>}
                        <span className={`text-sm font-bold ${goalMet ? "text-emerald-400" : "text-blue-400"}`}>
                          {Math.round(pct)}%
                        </span>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/25 rounded-lg text-blue-300 text-xs font-medium transition-all"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className={`h-full rounded-full ${goalMet ? "bg-emerald-400" : "bg-blue-400"}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </motion.div>

      {/* ── Edit Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {editEntry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditEntry(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-white font-bold text-xl mb-1">Edit Entry</h3>
              <p className="text-white/40 text-sm mb-5">
                {new Date(editEntry.date).toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric",
                })}
              </p>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                min={0}
                autoFocus
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white outline-none focus:border-blue-400/50 mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setEditEntry(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-medium">Cancel</button>
                <button onClick={handleUpdate}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-bold">Update</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
