import React, { useState, useEffect } from "react";

/**
 * IOSInstallBanner
 *
 * Shows a subtle install-prompt banner ONLY when:
 *   1. The user is on an iOS device (iPhone / iPad / iPod)
 *   2. The browser is Safari (not Chrome/Firefox on iOS)
 *   3. The app is NOT already running in standalone (installed PWA) mode
 *   4. The user has NOT previously dismissed the banner
 *
 * The banner slides up from the bottom of the screen with a soft animation,
 * pointing to the Share → "Add to Home Screen" workflow.
 */

const DISMISSED_KEY = "iosInstallBannerDismissed";

function detectiOSSafari() {
  const ua = window.navigator.userAgent;

  // Must be an iOS device
  const isIOS = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;

  // Must be Safari — Chrome/Firefox on iOS include "CriOS"/"FxiOS" in UA
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);

  // Must NOT already be installed (standalone mode)
  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  return isIOS && isSafari && !isStandalone;
}

export default function IOSInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed it
    const alreadyDismissed =
      localStorage.getItem(DISMISSED_KEY) === "true";

    if (!alreadyDismissed && detectiOSSafari()) {
      // Small delay so the banner doesn't flash immediately on page load
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* ── Backdrop (subtle) ─────────────────────────────────── */}
      <div
        onClick={handleDismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "transparent",
        }}
        aria-hidden="true"
      />

      {/* ── Banner ────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-label="Install Water Tracker app"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: "0 16px 24px",
          // Slide-up animation via CSS keyframes injected below
          animation: "slideUpBanner 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(15,30,60,0.97) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(96, 165, 250, 0.25)",
            boxShadow:
              "0 -4px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset",
            padding: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          {/* Water drop icon */}
          <div
            style={{
              fontSize: "2rem",
              lineHeight: 1,
              flexShrink: 0,
              marginTop: "2px",
              filter: "drop-shadow(0 0 8px rgba(96,165,250,0.6))",
            }}
          >
            💧
          </div>

          {/* Text content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: "0 0 6px 0",
                color: "#f1f5f9",
                fontWeight: 600,
                fontSize: "0.95rem",
                lineHeight: 1.3,
              }}
            >
              Install Water Tracker
            </p>
            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                fontSize: "0.85rem",
                lineHeight: 1.5,
              }}
            >
              To install this app and use it offline, tap the{" "}
              {/* iOS Share icon inline SVG */}
              <span
                aria-label="Share"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  verticalAlign: "middle",
                  margin: "0 3px",
                  color: "#60a5fa",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </span>{" "}
              <strong style={{ color: "#93c5fd" }}>Share</strong> icon below,
              then select{" "}
              <strong style={{ color: "#93c5fd" }}>"Add to Home Screen"</strong>.
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: "1rem",
              lineHeight: 1,
              transition: "background 0.2s",
              padding: 0,
              marginTop: "2px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
          >
            ✕
          </button>
        </div>

        {/* Pointer arrow pointing to the Safari toolbar at the bottom */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "10px solid rgba(96, 165, 250, 0.4)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Keyframe Styles ───────────────────────────────────── */}
      <style>{`
        @keyframes slideUpBanner {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
