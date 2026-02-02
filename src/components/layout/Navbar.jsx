import React from "react";
import { motion } from "framer-motion";
import { FaTint, FaHistory, FaCrosshairs, FaRedo } from "react-icons/fa";
import Button from "../ui/Button";

const Navbar = ({ onLogout, onShowHistory, onShowGoal, onShowReset }) => {
  return (
    <header className="header">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="header-content"
      >
        <div className="logo">
          <FaTint className="logo-icon" />
          <h1>Water Tracker</h1>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={onShowHistory}
          >
            <FaHistory /> History
          </button>
          <button
            className="btn btn-secondary"
            onClick={onShowGoal}
          >
            <FaCrosshairs /> Goal
          </button>
          <button
            className="btn btn-danger"
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
