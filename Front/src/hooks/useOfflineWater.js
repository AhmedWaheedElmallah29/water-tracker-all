import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

/**
 * STORAGE KEY used in localStorage to queue offline water log entries.
 * Each entry shape: { id: string, amount: number, timestamp: string }
 */
const PENDING_KEY = "pendingWaterLogs";

/**
 * useOfflineWater
 *
 * Wraps the `addWater` API call with offline-first logic:
 *
 *  • ONLINE  → calls the real API immediately (normal flow)
 *  • OFFLINE → saves entry to localStorage, shows a toast
 *  • When the 'online' event fires → automatically reads all pending
 *    entries from localStorage and syncs them to the backend one by one,
 *    then clears the queue.
 *
 * @param {Function} onSuccessfulAdd - Callback to call after a successful
 *   add (online or synced). Receives the API response data so the caller
 *   can update its state (e.g. setTodayData).
 * @param {Function} onSyncComplete - Optional callback invoked after all
 *   pending offline entries have been synced (e.g. to refresh history).
 *
 * @returns {{ offlineAddWater: Function, pendingCount: number }}
 *   - offlineAddWater(amount): call this instead of the raw API
 *   - pendingCount: number of entries waiting to be synced
 */
export function useOfflineWater(onSuccessfulAdd, onSyncComplete) {
  // Read initial pending count from localStorage
  const [pendingCount, setPendingCount] = useState(() => {
    try {
      const stored = localStorage.getItem(PENDING_KEY);
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Read all pending entries from localStorage safely */
  const readPending = () => {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  /** Persist the pending queue and update the count state */
  const savePending = (entries) => {
    localStorage.setItem(PENDING_KEY, JSON.stringify(entries));
    setPendingCount(entries.length);
  };

  /** Append a new entry to the offline queue */
  const queueEntry = (amount) => {
    const existing = readPending();
    const newEntry = {
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      amount,
      timestamp: new Date().toISOString(),
    };
    savePending([...existing, newEntry]);
    return newEntry;
  };

  // ── Sync Logic ─────────────────────────────────────────────────────────────

  const syncPendingEntries = useCallback(async () => {
    const pending = readPending();
    if (pending.length === 0) return;

    const syncToast = toast.loading(
      `Syncing ${pending.length} offline entr${pending.length === 1 ? "y" : "ies"}…`
    );

    const failed = [];
    let lastSuccessData = null;

    for (const entry of pending) {
      try {
        const response = await api.post("/api/water/add", {
          amount: entry.amount,
        });
        lastSuccessData = response.data;
      } catch (err) {
        console.error("[useOfflineWater] Failed to sync entry:", entry, err);
        failed.push(entry);
      }
    }

    if (failed.length === 0) {
      // All synced ✓
      savePending([]);
      toast.success(
        `Synced ${pending.length} offline entr${pending.length === 1 ? "y" : "ies"}! 💧`,
        { id: syncToast }
      );
      // Notify the caller so it can refresh UI
      if (lastSuccessData && onSuccessfulAdd) {
        onSuccessfulAdd(lastSuccessData);
      }
      if (onSyncComplete) {
        onSyncComplete();
      }
    } else {
      // Partial success: keep only the failed ones
      savePending(failed);
      const synced = pending.length - failed.length;
      toast.error(
        `Synced ${synced}/${pending.length} entries. ${failed.length} failed — will retry later.`,
        { id: syncToast }
      );
      // Still update UI for the ones that succeeded
      if (lastSuccessData && onSuccessfulAdd) {
        onSuccessfulAdd(lastSuccessData);
      }
    }
  }, [onSuccessfulAdd, onSyncComplete]);

  // ── Online Event Listener ──────────────────────────────────────────────────

  useEffect(() => {
    const handleOnline = () => {
      syncPendingEntries();
    };

    window.addEventListener("online", handleOnline);

    // Also attempt sync immediately if we load the page while already online
    // and there are pending entries (e.g. user closed app while offline)
    if (navigator.onLine && readPending().length > 0) {
      syncPendingEntries();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [syncPendingEntries]);

  // ── Main Export: offlineAddWater ───────────────────────────────────────────

  /**
   * Call this instead of directly calling the API for water additions.
   * Automatically handles both online and offline scenarios.
   */
  const offlineAddWater = useCallback(
    async (amount) => {
      if (!navigator.onLine) {
        // ── OFFLINE PATH ──
        const entry = queueEntry(amount);
        toast(
          `Saved ${amount}ml offline 📶\nWill sync when you're back online.`,
          {
            icon: "💾",
            duration: 4000,
            style: {
              background: "rgba(15, 23, 42, 0.95)",
              color: "#f8fafc",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              borderRadius: "12px",
            },
          }
        );
        console.log("[useOfflineWater] Queued offline entry:", entry);
        return null;
      }

      // ── ONLINE PATH ──
      try {
        const response = await api.post("/api/water/add", { amount });
        if (onSuccessfulAdd) {
          onSuccessfulAdd(response.data);
        }
        toast.success(`Added ${amount}ml of water 💧`);
        return response.data;
      } catch (error) {
        console.error("[useOfflineWater] Online add failed:", error);
        toast.error("Failed to add water. Please try again.");
        throw error;
      }
    },
    [onSuccessfulAdd]
  );

  return { offlineAddWater, pendingCount };
}
