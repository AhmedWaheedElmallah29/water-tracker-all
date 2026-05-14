import React, { useState } from "react";
import { FaTint } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/signup", { username, password });
      setLoading(false);
      setSuccess("Signup successful! Redirecting to login...");
      toast.success("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setLoading(false);
      // Show specific error from backend if available
      const backendError = err.response?.data?.error || err.response?.data?.message;
      const msg = backendError || "Signup failed. Please try again.";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative z-10">
      <form 
        className="bg-glass-bg backdrop-blur-[20px] p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-glass-border w-full max-w-[400px] flex flex-col gap-4 relative overflow-hidden" 
        onSubmit={handleSubmit}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-300/10 rounded-3xl -z-10" />

        <div className="flex items-center justify-center gap-3 mb-2">
          <FaTint className="text-[2rem] text-primary-blue drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
          <h1 className="text-text-primary text-[1.8rem] font-bold m-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Water Tracker</h1>
        </div>
        <h2 className="text-center text-text-primary text-2xl font-semibold">Sign Up</h2>
        <div
          className="text-[0.95rem] text-text-muted mb-2 text-center"
        >
          Username must be at least 3 characters.
          <br />
          Password must be at least 6 characters.
        </div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          className="w-full p-4 bg-glass-bg border-2 border-glass-border rounded-xl text-base outline-none transition-all duration-300 text-text-primary backdrop-blur-[10px] placeholder:text-text-muted focus:border-primary-blue focus:shadow-[0_0_20px_rgba(96,165,250,0.3)]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 bg-glass-bg border-2 border-glass-border rounded-xl text-base outline-none transition-all duration-300 text-text-primary backdrop-blur-[10px] placeholder:text-text-muted focus:border-primary-blue focus:shadow-[0_0_20px_rgba(96,165,250,0.3)]"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-4 bg-glass-bg border-2 border-glass-border rounded-xl text-base outline-none transition-all duration-300 text-text-primary backdrop-blur-[10px] placeholder:text-text-muted focus:border-primary-blue focus:shadow-[0_0_20px_rgba(96,165,250,0.3)]"
        />
        {error && <div className="bg-danger-red/10 text-danger-red p-3 rounded-xl border border-danger-red/20 text-center text-sm">{error}</div>}
        {success && <div className="bg-success-green/10 text-success-green p-3 rounded-xl border border-success-green/20 text-center text-sm">{success}</div>}
        <button 
          className="w-full px-6 py-3 border border-white/10 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex justify-center items-center gap-2 bg-gradient-to-br from-primary-blue to-light-blue text-white shadow-[0_4px_12px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(96,165,250,0.4)] disabled:opacity-70 disabled:cursor-not-allowed" 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="text-center text-text-secondary text-sm mt-4">
          Already have an account? <Link to="/login" className="text-primary-blue font-semibold hover:underline">Login</Link>
        </div>
      </form>
    </div>
  );
}
