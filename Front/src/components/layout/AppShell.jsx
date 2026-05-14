import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import IOSInstallBanner from "../ui/IOSInstallBanner";

/**
 * AppShell — Authenticated page wrapper.
 * Renders the top Navbar (desktop) and Bottom Nav (mobile) around page content.
 */
export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar — hidden on mobile, visible on md+ */}
      <Navbar />

      {/* iOS PWA install banner */}
      <IOSInstallBanner />

      {/* Page content — extra bottom padding on mobile for bottom nav */}
      <main className="flex-1 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom Nav — visible on mobile only */}
      <BottomNav />
    </div>
  );
}
