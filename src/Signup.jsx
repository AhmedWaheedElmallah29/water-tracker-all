import React, { useState } from "react";
import { FaTint } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import "./App.css";
import api from "./api";

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
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/auth/signup", { username, password });
      setLoading(false);
      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setLoading(false);
      // Show specific error from backend if available
      const backendError = err.response?.data?.error || err.response?.data?.message;
      setError(backendError || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-logo">
          <FaTint className="logo-icon" />
          <h1>Water Tracker</h1>
        </div>
        <h2>Sign Up</h2>
        <div
          style={{
            fontSize: "0.95rem",
            color: "#888",
            marginBottom: 8,
            textAlign: "center",
          }}
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
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="login-signup-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}
