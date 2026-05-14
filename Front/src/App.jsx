import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

import AppShell from "./components/layout/AppShell";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard/Dashboard";
import HistoryPage from "./pages/History/HistoryPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import NotFound from "./pages/NotFound";

/** Wraps protected routes — redirects to Clerk sign-in if not authenticated */
function ProtectedLayout() {
  return (
    <>
      <SignedIn>
        <AppShell />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function App() {
  const location = useLocation();

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            color: "#f8fafc",
            border: "1px solid rgba(96, 165, 250, 0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(20px)",
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public — Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Protected — App Shell wraps all authenticated pages */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
