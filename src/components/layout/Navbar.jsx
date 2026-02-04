import { motion } from "framer-motion";
import { FaTint, FaHistory, FaCrosshairs, FaRedo } from "react-icons/fa";
import Button from "../ui/Button";

const Navbar = ({ onLogout, onShowHistory, onShowGoal, onShowReset }) => {
  return (
    <header className="mb-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center max-w-[1200px] mx-auto py-5 px-8 bg-glass-bg backdrop-blur-[20px] rounded-3xl border border-glass-border shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden"
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-300/10 rounded-3xl -z-10 pointer-events-none" />

        <div className="flex items-center gap-3">
          <FaTint className="text-[2rem] text-primary-blue drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
          <h1 className="text-text-primary text-[1.8rem] font-bold m-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Water Tracker</h1>
        </div>
        <div className="flex gap-3">
          <button
            className="px-6 py-3 border border-glass-border rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-[10px] bg-glass-bg text-text-primary hover:bg-white/10 hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
            onClick={onShowHistory}
          >
            <FaHistory /> History
          </button>
          <button
            className="px-6 py-3 border border-glass-border rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-[10px] bg-glass-bg text-text-primary hover:bg-white/10 hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
            onClick={onShowGoal}
          >
            <FaCrosshairs /> Goal
          </button>
          <button
            className="px-6 py-3 border border-white/10 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-[10px] bg-gradient-to-br from-danger-red to-danger-dark text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)]"
            onClick={onShowReset}
          >
            <FaRedo /> Reset Day
          </button>
          <Button onLogout={onLogout} />
        </div>
      </motion.div>
    </header>
  );
};

export default Navbar;
