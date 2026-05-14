import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTint, FaPlus } from "react-icons/fa";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";

const BOTTLE_SIZES = [
  { name: "Small Glass", size: 200, icon: "🥤" },
  { name: "Regular Glass", size: 250, icon: "🥤" },
  { name: "Large Glass", size: 350, icon: "🥤" },
  { name: "Water Bottle", size: 500, icon: "💧" },
  { name: "Large Bottle", size: 750, icon: "💧" },
  { name: "Sports Bottle", size: 1000, icon: "🏃" },
];

export default function Dashboard({ onLogout }) {
  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showEditModal, setShowEditModal] = useState(false);
  const [editHistoryEntry, setEditHistoryEntry] = useState(null);
  const [editHistoryAmount, setEditHistoryAmount] = useState(0);

  useEffect(() => {
    fetchTodayData();
    fetchHistory();
  }, []);

  const fetchTodayData = async () => {
    try {
      const response = await api.get("/api/water/today");
      setTodayData(response.data);
    } catch (error) {
      console.error("Error fetching today data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get("/api/water/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const addWater = async (amount) => {
    try {
      const response = await api.post("/api/water/add", { amount });
      setTodayData(response.data);
      fetchHistory();
      toast.success(`added ${amount}ml of water`);
    } catch (error) {
      console.error("Error adding water:", error);
      toast.error("Failed to add water");
    }
  };

  const updateGoal = async () => {
    if (!newGoal || newGoal <= 0) return;
    try {
      const response = await api.put("/api/water/goal", {
        goal: parseInt(newGoal),
      });
      setTodayData(response.data);
      setShowGoalModal(false);
      setNewGoal("");
      toast.success("Daily goal updated!");
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    }
  };

  const handleCustomAmount = () => {
    if (!customAmount || customAmount <= 0) return;
    addWater(parseInt(customAmount));
    setCustomAmount("");
  };

  const removeWater = async (entryId) => {
    try {
      const response = await api.delete(`/api/water/remove/${entryId}`);
      setTodayData(response.data);
      fetchHistory();
      toast.success("Entry removed");
    } catch (error) {
      console.error("Error removing water:", error);
      toast.error("Failed to remove water entry");
    }
  };

  const removeWaterAmount = async (amount) => {
    try {
      const response = await api.delete("/api/water/remove-amount", {
        data: { amount: parseInt(amount) },
      });
      setTodayData(response.data);
      fetchHistory();
      toast.success(`Removed ${amount}ml`);
    } catch (error) {
      console.error("Error removing amount:", error);
      toast.error("Failed to remove water amount");
    }
  };

  const handleRemoveAmount = () => {
    if (!removeAmount || removeAmount <= 0) return;
    removeWaterAmount(parseInt(removeAmount));
    setRemoveAmount("");
  };

  const getProgressPercentage = () => {
    if (!todayData) return 0;
    const goalInMl = todayData.goal * 1000;
    return Math.min((todayData.amount / goalInMl) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return "#10b981"; // success-green
    if (percentage >= 75) return "#f59e0b"; // warning-orange
    return "#60a5fa"; // primary-blue
  };

  const resetDay = async () => {
    try {
      const response = await api.post("/api/water/reset");
      setTodayData(response.data.waterEntry);
      fetchHistory();
      setShowResetModal(false);
      toast.success("Daily progress reset");
    } catch (error) {
      toast.error("Failed to reset water data.");
      setShowResetModal(false);
    }
  };

  const handleEditHistory = (entry) => {
    setEditHistoryEntry(entry);
    setEditHistoryAmount(entry.amount);
  };

  const handleUpdateHistory = async () => {
    if (!editHistoryEntry) return;
    try {
      await api.put(`/api/water/update-by-id/${editHistoryEntry._id}`, {
        amount: parseInt(editHistoryAmount),
      });
      setEditHistoryEntry(null);
      toast.success("Entry updated!");
      fetchHistory();
    } catch (error) {
      toast.error("Failed to update entry.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-secondary gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl text-primary-blue drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]"
        >
          <FaTint />
        </motion.div>
        <p>Loading your hydration data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 relative z-10">
      <Navbar 
        onLogout={onLogout}
        onShowHistory={() => setShowHistoryModal(true)}
        onShowGoal={() => setShowGoalModal(true)}
        onShowReset={() => setShowResetModal(true)}
      />

      <main className="max-w-[1200px] mx-auto flex flex-col gap-[30px]">
        {/* Today's Progress */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-glass-bg backdrop-blur-[20px] rounded-3xl p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-300/5 rounded-3xl -z-10" />
          <div className="flex flex-col items-center">
            <div className="text-center mb-[30px] flex flex-col items-center gap-2">
              <h2 className="text-text-primary text-[1.8rem] font-bold m-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Today's Progress</h2>
              <span className="text-text-secondary text-base">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex justify-center items-center my-5">
              <div className="relative flex justify-center items-center">
                <svg width="200" height="200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="#ffffff1a"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke={getProgressColor()}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 80 * (1 - getProgressPercentage() / 100)
                    }`}
                    transform="rotate(-90 100 100)"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>
                <div className="absolute text-center flex flex-col items-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-[2.5rem] font-bold text-text-primary drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      {(todayData?.amount || 0) / 1000}
                    </span>
                    <span className="text-[1.2rem] text-text-secondary font-medium">L</span>
                  </div>
                  <div className="text-text-secondary text-[0.9rem] mt-1">
                    of {todayData?.goal || 3} L
                  </div>
                  <div className="text-primary-blue text-[1.1rem] font-semibold mt-2 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
                    {Math.round(getProgressPercentage())}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Goal Progress Info */}
        {todayData && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-glass-bg backdrop-blur-[20px] rounded-3xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-3xl -z-10" />
            <div className="flex justify-around items-center gap-5">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[0.9rem] text-text-secondary font-medium">Current:</span>
                <span className="text-[1.3rem] font-bold text-text-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {(todayData.amount / 1000).toFixed(1)}L
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[0.9rem] text-text-secondary font-medium">Goal:</span>
                <span className="text-[1.3rem] font-bold text-text-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{todayData.goal}L</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[0.9rem] text-text-secondary font-medium">Remaining:</span>
                <span className="text-[1.3rem] font-bold text-primary-blue drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
                  {Math.max(0, todayData.goal * 1000 - todayData.amount)}ml
                </span>
              </div>
            </div>
          </motion.section>
        )}

        {/* Quick Add Water */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass-bg backdrop-blur-[20px] rounded-3xl p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-300/5 rounded-3xl -z-10" />
          <h3 className="text-text-primary text-[1.5rem] font-semibold mb-5 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Quick Add Water</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            {BOTTLE_SIZES.map((bottle) => (
              <motion.button
                key={bottle.size}
                className="bg-gradient-to-br from-primary-blue to-light-blue border border-white/10 rounded-2xl p-5 text-white cursor-pointer flex flex-col items-center gap-2 shadow-[0_8px_16px_rgba(96,165,250,0.3)] backdrop-blur-[10px] hover:from-light-blue hover:to-primary-blue hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(96,165,250,0.4)] transition-all duration-300 ease-in-out active:scale-95"
                onClick={() => addWater(bottle.size)}
              >
                <span className="text-[2rem]">{bottle.icon}</span>
                <span className="text-[1.1rem] font-semibold">{bottle.size}ml</span>
                <span className="text-[0.9rem] opacity-90">{bottle.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Custom Amount */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass-bg backdrop-blur-[20px] rounded-3xl p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-3xl -z-10" />
          <h3 className="text-text-primary text-[1.5rem] font-semibold mb-5 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Custom Amount</h3>
          <div className="flex gap-3 max-w-[400px] mx-auto">
            <input
              type="number"
              placeholder="Enter amount in ml"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCustomAmount()}
              className="flex-1 p-4 bg-glass-bg border-2 border-glass-border rounded-xl text-base outline-none transition-all duration-300 text-text-primary backdrop-blur-[10px] placeholder:text-text-muted focus:border-primary-blue focus:shadow-[0_0_20px_rgba(96,165,250,0.3)]"
            />
            <button 
              className="px-6 py-3 border border-white/10 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 bg-gradient-to-br from-primary-blue to-light-blue text-white shadow-[0_4px_12px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(96,165,250,0.4)]" 
              onClick={handleCustomAmount}
            >
              <FaPlus /> Add
            </button>
          </div>
        </motion.section>

        {/* Remove Amount */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass-bg backdrop-blur-[20px] rounded-3xl p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 rounded-3xl -z-10" />
          <h3 className="text-text-primary text-[1.5rem] font-semibold mb-5 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Remove Water</h3>
          <div className="flex gap-3 max-w-[400px] mx-auto">
            <input
              type="number"
              placeholder="Enter amount to remove in ml"
              value={removeAmount}
              onChange={(e) => setRemoveAmount(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleRemoveAmount()}
              className="flex-1 p-4 bg-glass-bg border-2 border-glass-border rounded-xl text-base outline-none transition-all duration-300 text-text-primary backdrop-blur-[10px] placeholder:text-text-muted focus:border-primary-blue focus:shadow-[0_0_20px_rgba(96,165,250,0.3)]"
            />
            <button
              className="px-6 py-3 border border-white/10 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 bg-gradient-to-br from-danger-red to-danger-dark text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)] disabled:bg-text-muted disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              onClick={handleRemoveAmount}
              disabled={!removeAmount || removeAmount <= 0}
            >
              Remove
            </button>
          </div>
        </motion.section>

        {/* Today's Entries */}
        {todayData?.entries && todayData.entries.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-glass-bg backdrop-blur-[20px] rounded-3xl p-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-300/5 rounded-3xl -z-10" />
            <h3 className="text-text-primary text-[1.5rem] font-semibold mb-5 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Today's Entries</h3>
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {todayData.entries
                .slice()
                .reverse()
                .map((entry, index) => (
                  <motion.div
                    key={entry._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-glass-bg border border-glass-border rounded-xl transition-all duration-300 backdrop-blur-[10px] hover:bg-white/10 hover:translate-x-1 hover:shadow-md"
                  >
                    <FaTint
                      className={`text-[1.2rem] drop-shadow-[0_0_5px_rgba(96,165,250,0.5)] ${
                        entry.amount < 0 ? "text-danger-red" : "text-primary-blue"
                      }`}
                    />
                    <div className="flex flex-col gap-1 flex-1">
                      <span
                        className={`font-semibold text-[1.1rem] ${
                          entry.amount < 0 ? "text-danger-red line-through" : "text-text-primary"
                        }`}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {entry.amount}ml
                      </span>
                      <span className="text-text-secondary text-[0.9rem]">
                        {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {entry.note && (
                        <span className="text-text-muted text-[0.8rem] italic">{entry.note}</span>
                      )}
                    </div>
                    {entry._id && (
                      <button
                        className={`w-6 h-6 rounded-full border-none flex items-center justify-center cursor-pointer text-[1.2rem] font-bold transition-all duration-300 ml-auto backdrop-blur-[10px] text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] ${
                          entry.amount < 0 ? "bg-success-green hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-danger-red"
                        }`}
                        onClick={() => {
                          toast((t) => (
                            <div className="flex flex-col gap-2">
                              <span>Delete this entry?</span>
                              <div className="flex gap-2 justify-center">
                                <button
                                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                  onClick={async () => {
                                    toast.dismiss(t.id);
                                    await removeWater(entry._id);
                                  }}
                                >
                                  Yes
                                </button>
                                <button
                                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                  onClick={() => toast.dismiss(t.id)}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ), { duration: 4000 });
                        }}
                        title={
                          entry.amount < 0
                            ? "Restore this removed water"
                            : "Remove this entry"
                        }
                      >
                        {entry.amount < 0 ? "↺" : "×"}
                      </button>
                    )}
                  </motion.div>
                ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] p-5 backdrop-blur-[10px]" onClick={() => setShowGoalModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-glass-bg backdrop-blur-[20px] rounded-[20px] p-[30px] max-w-[500px] w-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-300/5 rounded-[20px] -z-10" />
            <h3 className="text-text-primary text-[1.5rem] font-semibold mb-3 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Set Daily Goal</h3>
            <p className="text-text-secondary mb-5 text-center">How much water do you want to drink today?</p>
            <input
              type="number"
              placeholder="Enter goal in liters (e.g., 3)"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="w-full p-4 bg-glass-bg border-2 border-glass-border rounded-xl text-base mb-5 outline-none transition-all duration-300 text-text-primary backdrop-blur-[10px] placeholder:text-text-muted focus:border-primary-blue focus:shadow-[0_0_20px_rgba(96,165,250,0.3)]"
            />
            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-3 border border-glass-border rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 bg-glass-bg text-text-primary hover:bg-white/10 hover:-translate-y-px hover:shadow-md"
                onClick={() => setShowGoalModal(false)}
              >
                Cancel
              </button>
              <button className="px-6 py-3 border border-white/10 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 bg-gradient-to-br from-primary-blue to-light-blue text-white shadow-[0_4px_12px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(96,165,250,0.4)]" onClick={updateGoal}>
                Update Goal
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] p-5 backdrop-blur-[10px]"
          onClick={() => setShowHistoryModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-glass-bg backdrop-blur-[20px] rounded-[20px] p-[30px] max-w-[600px] w-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-300/5 rounded-[20px] -z-10" />
            <h3 className="text-text-primary text-[1.5rem] font-semibold mb-3 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Water History</h3>
            <div className="flex-1 overflow-y-auto mb-5 custom-scrollbar pr-2">
              {history
                .filter((entry) => new Date(entry.date) <= new Date())
                .map((entry) => (
                  <div key={entry._id} className="flex items-center gap-4 p-4 border-b border-glass-border bg-glass-bg rounded-lg mb-2 backdrop-blur-[10px]">
                    <div className="font-semibold text-text-primary min-w-[80px]">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-2 bg-glass-bg rounded overflow-hidden backdrop-blur-[10px]">
                        <div
                          className="h-full rounded transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              (entry.amount / (entry.goal * 1000)) * 100,
                              100
                            )}%`,
                            backgroundColor:
                              entry.amount >= entry.goal * 1000
                                ? "#10b981"
                                : "#60a5fa",
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="font-semibold text-text-secondary min-w-[100px] text-right">
                      {entry.amount}ml / {entry.goal}L
                    </div>
                    <button
                      className="px-4 py-2 border border-white/10 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-primary-blue to-light-blue text-white shadow-md hover:-translate-y-0.5"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleEditHistory(entry)}
                      disabled={new Date(entry.date) > new Date()}
                    >
                      Edit
                    </button>
                  </div>
                ))}
            </div>
            <button
              className="px-6 py-3 border border-white/10 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 self-center bg-gradient-to-br from-primary-blue to-light-blue text-white shadow-[0_4px_12px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(96,165,250,0.4)]"
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Edit History Entry Modal */}
      {editHistoryEntry && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] p-5 backdrop-blur-[10px]"
          onClick={() => setEditHistoryEntry(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-glass-bg backdrop-blur-[20px] rounded-[20px] p-[30px] max-w-[500px] w-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-300/5 rounded-[20px] -z-10" />
            <h3 className="text-text-primary text-[1.5rem] font-semibold mb-3 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Edit Water Amount</h3>
            <div style={{ marginBottom: 12 }} className="text-center text-text-secondary">
              {new Date(editHistoryEntry.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <input
              type="number"
              value={editHistoryAmount}
              onChange={(e) => setEditHistoryAmount(e.target.value)}
              min={0}
              className="w-full p-4 bg-glass-bg border-2 border-glass-border rounded-xl text-base mb-5 outline-none transition-all duration-300 text-text-primary backdrop-blur-[10px] placeholder:text-text-muted focus:border-primary-blue focus:shadow-[0_0_20px_rgba(96,165,250,0.3)]"
            />
            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-3 border border-glass-border rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 bg-glass-bg text-text-primary hover:bg-white/10 hover:-translate-y-px hover:shadow-md"
                onClick={() => setEditHistoryEntry(null)}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-3 border border-white/10 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 bg-gradient-to-br from-primary-blue to-light-blue text-white shadow-[0_4px_12px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(96,165,250,0.4)]"
                onClick={handleUpdateHistory}
              >
                Update
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] p-5 backdrop-blur-[10px]" onClick={() => setShowResetModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-glass-bg backdrop-blur-[20px] rounded-[20px] p-[30px] max-w-[500px] w-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-glass-border relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-300/5 rounded-[20px] -z-10" />
            <h3 className="text-text-primary text-[1.5rem] font-semibold mb-3 text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Reset All Water Data?</h3>
            <p className="text-text-secondary mb-5 text-center">
              This will delete all added and removed water for today and reset
              your progress to zero. Are you sure?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-3 border border-glass-border rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 bg-glass-bg text-text-primary hover:bg-white/10 hover:-translate-y-px hover:shadow-md"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-3 border border-white/10 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 bg-gradient-to-br from-danger-red to-danger-dark text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)]"
                onClick={resetDay}
              >
                Yes, Reset Day
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
