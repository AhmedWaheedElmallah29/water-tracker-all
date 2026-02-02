import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  useEffect(() => {
    const path = window.location.pathname;
    // If not authenticated and not on public pages, redirect to login
    if (!isAuthenticated && path !== "/login" && path !== "/signup") {
      navigate("/login", { replace: true });
    }
    // If authenticated and on public pages, redirect to dashboard
    if (isAuthenticated && (path === "/login" || path === "/signup")) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Login
            onLogin={() => {
              localStorage.setItem("isAuthenticated", "true");
              setIsAuthenticated(true);
              navigate("/dashboard", { replace: true });
            }}
          />
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
      {/* 404 Route - Only reachable if authenticated (due to useEffect guard) or if logic changes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
