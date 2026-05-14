import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWifi } from "react-icons/fa";
import toast from "react-hot-toast";
import { useApi } from "../../hooks/useApi";
import { useOfflineWater } from "../../hooks/useOfflineWater";
import WaterProgressRing from "../../components/ui/WaterProgressRing";

const BOTTLE_SIZES = [
  {
    name: "Small Glass",
    size: 200,
    icon: "🥛",
    color: "from-sky-500 to-blue-500",
  },
  {
    name: "Regular Glass",
    size: 250,
    icon: "🥤",
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Large Glass",
    size: 350,
    icon: "🥤",
    color: "from-blue-600 to-indigo-500",
  },
  {
    name: "Water Bottle",
    size: 500,
    icon: "💧",
    color: "from-indigo-500 to-violet-500",
  },
  {
    name: "Large Bottle",
    size: 750,
    icon: "💧",
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Sports Bottle",
    size: 1000,
    icon: "🏃",
    color: "from-purple-500 to-fuchsia-500",
  },
];

/** Calculate consecutive-day hydration streak from history data */
function calculateStreak(history) {
  if (!history || history.length === 0) return 0;
  const sorted = [...history]
    .filter((e) => new Date(e.date) <= new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const entryDate = new Date(sorted[i].date);
    entryDate.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);

    if (entryDate.getTime() !== expected.getTime()) break;
    if (sorted[i].amount >= (sorted[i].goal || 3) * 1000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export default function Dashboard() {
  const api = useApi();
  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get("/api/water/history");
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }, [api]);

  const { offlineAddWater, pendingCount } = useOfflineWater((data) => {
    setTodayData(data);
    fetchHistory();
  }, fetchHistory);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await api.get("/api/water/today");
        setTodayData(res.data);
      } catch (err) {
        console.error("Error fetching today:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
    fetchHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addWater = (amount) => offlineAddWater(amount);

  const handleCustomAmount = () => {
    if (!customAmount || customAmount <= 0) return;
    addWater(parseInt(customAmount));
    setCustomAmount("");
  };

  const handleRemoveAmount = async () => {
    if (!removeAmount || removeAmount <= 0) return;
    try {
      const res = await api.delete("/api/water/remove-amount", {
        data: { amount: parseInt(removeAmount) },
      });
      setTodayData(res.data);
      fetchHistory();
      toast.success(`Removed ${removeAmount}ml`);
    } catch {
      toast.error("Failed to remove water amount");
    }
    setRemoveAmount("");
  };

  const removeEntry = async (entryId) => {
    try {
      const res = await api.delete(`/api/water/remove/${entryId}`);
      setTodayData(res.data);
      fetchHistory();
      toast.success("Entry removed");
    } catch {
      toast.error("Failed to remove entry");
    }
  };

  const updateGoal = async () => {
    if (!newGoal || newGoal <= 0) return;
    try {
      const res = await api.put("/api/water/goal", { goal: parseInt(newGoal) });
      setTodayData(res.data);
      setShowGoalModal(false);
      setNewGoal("");
      toast.success("Daily goal updated! 🎯");
    } catch {
      toast.error("Failed to update goal");
    }
  };

  const resetDay = async () => {
    try {
      const res = await api.post("/api/water/reset");
      setTodayData(res.data.waterEntry);
      fetchHistory();
      setShowResetModal(false);
      toast.success("Daily progress reset");
    } catch {
      toast.error("Failed to reset");
      setShowResetModal(false);
    }
  };

  const percentage = todayData
    ? Math.min((todayData.amount / (todayData.goal * 1000)) * 100, 100)
    : 0;
  const streak = calculateStreak(history);
  const remaining = todayData
    ? Math.max(0, todayData.goal * 1000 - todayData.amount)
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="text-5xl"
        >
          💧
        </motion.div>
        <p className="text-white/50 text-sm">Loading your hydration data…</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-7xl mx-auto px-4 py-6 md:px-8"
    >
      {/* Offline banner */}
      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 px-4 py-3 mb-4 bg-amber-500/10 border border-amber-400/25 rounded-2xl text-amber-300 text-sm"
          >
            <FaWifi className="opacity-50" />
            <span>
              Offline — <strong>{pendingCount}</strong> log
              {pendingCount !== 1 && "s"} will sync on reconnect.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Date Header ─────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {new Date().toLocaleDateString("en-US", { weekday: "long" })}{" "}
          <span className="text-white/40 font-normal text-xl">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </span>
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Track your hydration for today
        </p>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────── */}
      {/* Mobile: single column | Desktop (md+): two-column split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Progress Ring Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-3xl" />
            <h2 className="text-white font-semibold text-lg mb-5 text-center">
              Today&apos;s Progress
            </h2>

            {/* Ring */}
            <div className="flex justify-center mb-6">
              <WaterProgressRing
                percentage={percentage}
                amount={todayData?.amount || 0}
                goal={todayData?.goal || 3}
              />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Consumed",
                  value: `${((todayData?.amount || 0) / 1000).toFixed(1)}L`,
                  color: "text-blue-400",
                },
                {
                  label: "Remaining",
                  value: `${remaining}ml`,
                  color: "text-amber-400",
                },
                {
                  label: "🔥 Streak",
                  value: `${streak} day${streak !== 1 ? "s" : ""}`,
                  color: "text-orange-400",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 bg-white/5 rounded-2xl border border-white/8"
                >
                  <div className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Custom Amount + Remove — below ring on mobile, left col on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10"
          >
            <h3 className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-4">
              Custom Amount
            </h3>
            <div className="flex gap-3 mb-3">
              <input
                type="number"
                placeholder="Enter ml..."
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCustomAmount()}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition text-sm"
              />
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleCustomAmount}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(96,165,250,0.3)] text-sm"
              >
                + Add
              </motion.button>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Amount to remove..."
                value={removeAmount}
                onChange={(e) => setRemoveAmount(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleRemoveAmount()}
                className="flex-1 min-w-0 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 outline-none focus:border-red-400/50 transition text-sm"
              />
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleRemoveAmount}
                disabled={!removeAmount || removeAmount <= 0}
                className="shrink-0 px-5 py-3 bg-gradient-to-r from-red-500/70 to-red-600/70 disabled:opacity-30 text-white font-semibold rounded-xl text-sm"
              >
                Remove
              </motion.button>
            </div>
          </motion.div>

          {/* Quick actions row */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setShowGoalModal(true)}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-sm font-medium transition-all"
            >
              🎯 Set Goal
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setShowResetModal(true)}
              className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 rounded-xl text-red-400 text-sm font-medium transition-all"
            >
              🔄 Reset Day
            </motion.button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Quick Add Buttons — thumb-friendly on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10"
          >
            <h3 className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Add
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {BOTTLE_SIZES.map((bottle) => (
                <motion.button
                  key={bottle.size}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => addWater(bottle.size)}
                  className={`bg-gradient-to-br ${bottle.color} p-4 rounded-2xl text-white flex flex-col items-center gap-1 shadow-lg active:shadow-none transition-all`}
                >
                  <span className="text-2xl">{bottle.icon}</span>
                  <span className="font-bold text-base">{bottle.size}ml</span>
                  <span className="text-white/75 text-xs">{bottle.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Today's Entries */}
          {todayData?.entries && todayData.entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10"
            >
              <h3 className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-4">
                Today&apos;s Entries
              </h3>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {[...todayData.entries].reverse().map((entry, idx) => (
                  <motion.div
                    key={entry._id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/8 group"
                  >
                    <span
                      className={`text-sm ${entry.amount < 0 ? "text-red-400" : "text-blue-400"}`}
                    >
                      💧
                    </span>
                    <div className="flex-1">
                      <span
                        className={`font-semibold text-sm ${entry.amount < 0 ? "text-red-400 line-through" : "text-white"}`}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {entry.amount}ml
                      </span>
                      <div className="text-white/35 text-xs">
                        {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {entry._id && (
                      <button
                        onClick={() => {
                          toast(
                            (t) => (
                              <div className="flex flex-col gap-2 text-sm">
                                <span>Delete this entry?</span>
                                <div className="flex gap-2">
                                  <button
                                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs"
                                    onClick={() => {
                                      toast.dismiss(t.id);
                                      removeEntry(entry._id);
                                    }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    className="px-3 py-1 bg-white/20 text-white rounded-lg text-xs"
                                    onClick={() => toast.dismiss(t.id)}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ),
                            { duration: 5000 },
                          );
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 text-sm hover:bg-red-500/40 transition-all"
                      >
                        ×
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Goal Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showGoalModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-white font-bold text-xl mb-2">
                Set Daily Goal 🎯
              </h3>
              <p className="text-white/50 text-sm mb-5">
                How many liters per day?
              </p>
              <input
                type="number"
                placeholder="e.g. 3"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-white/25 outline-none focus:border-blue-400/50 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={updateGoal}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-bold shadow-[0_0_15px_rgba(96,165,250,0.3)]"
                >
                  Save Goal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reset Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showResetModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-4xl text-center mb-3">⚠️</div>
              <h3 className="text-white font-bold text-xl mb-2 text-center">
                Reset Today?
              </h3>
              <p className="text-white/50 text-sm text-center mb-6">
                This will delete all water logs for today and set your progress
                to zero.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={resetDay}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-bold"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
