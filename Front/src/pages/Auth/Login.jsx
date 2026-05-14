import React, { useState } from "react";
import { FaTint } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/signin", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("isAuthenticated", "true");
      setLoading(false);
      toast.success("Logged in successfully!");
      onLogin();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative z-10">
      <form 
        className="bg-glass-bg backdrop-blur-[20px] p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-glass-border w-full max-w-[400px] flex flex-col gap-5 relative overflow-hidden" 
        onSubmit={handleSubmit}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-300/10 rounded-3xl -z-10" />
        
        <div className="flex items-center justify-center gap-3 mb-2">
          <FaTint className="text-[2rem] text-primary-blue drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
          <h1 className="text-text-primary text-[1.8rem] font-bold m-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Water Tracker</h1>
        </div>
        <h2 className="text-center text-text-primary text-2xl font-semibold">Login</h2>
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
        {error && <div className="bg-danger-red/10 text-danger-red p-3 rounded-xl border border-danger-red/20 text-center text-sm">{error}</div>}
        <button 
          className="w-full px-6 py-3 border border-white/10 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 flex justify-center items-center gap-2 bg-gradient-to-br from-primary-blue to-light-blue text-white shadow-[0_4px_12px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(96,165,250,0.4)] disabled:opacity-70 disabled:cursor-not-allowed" 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="text-center text-text-secondary text-sm mt-4">
          Don't have an account? <Link to="/signup" className="text-primary-blue font-semibold hover:underline">Sign up</Link>
        </div>
      </form>
    </div>
  );
}
