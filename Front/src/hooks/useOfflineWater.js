import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

const PENDING_KEY = "pendingWaterLogs";
const BASE_URL = import.meta.env.VITE_API_URL;

export function useOfflineWater(onSuccessfulAdd, onSyncComplete) {
  const { getToken } = useAuth();

  // 1. هنا السر: عملنا قفل عشان نمنع التكرار
  const syncLock = useRef(false);

  const [pendingCount, setPendingCount] = useState(() => {
    try {
      const stored = localStorage.getItem(PENDING_KEY);
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  });

  const readPending = () => {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const savePending = (entries) => {
    localStorage.setItem(PENDING_KEY, JSON.stringify(entries));
    setPendingCount(entries.length);
  };

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

  const syncPendingEntries = useCallback(async () => {
    // 2. لو الباب مقفول (في مزامنة بتحصل حالياً)، اخرج فوراً ومتكررش الطلب
    if (syncLock.current) return;

    const pending = readPending();
    if (pending.length === 0) return;

    // 3. اقفل الباب عشان محدش يزامن معاك
    syncLock.current = true;

    const syncToast = toast.loading(
      `Syncing ${pending.length} offline entr${pending.length === 1 ? "y" : "ies"}…`,
    );

    const token = await getToken();
    const headers = { Authorization: `Bearer ${token}` };

    const failed = [];
    let lastSuccessData = null;

    for (const entry of pending) {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/water/add`,
          { amount: entry.amount },
          { headers },
        );
        lastSuccessData = response.data;
      } catch (err) {
        console.error("[useOfflineWater] Failed to sync entry:", entry, err);
        failed.push(entry);
      }
    }

    if (failed.length === 0) {
      savePending([]);
      toast.success(
        `Synced ${pending.length} offline entr${pending.length === 1 ? "y" : "ies"}! 💧`,
        { id: syncToast },
      );
      if (lastSuccessData && onSuccessfulAdd) onSuccessfulAdd(lastSuccessData);
      if (onSyncComplete) onSyncComplete();
    } else {
      savePending(failed);
      const synced = pending.length - failed.length;
      toast.error(
        `Synced ${synced}/${pending.length} entries. ${failed.length} failed.`,
        { id: syncToast },
      );
      if (lastSuccessData && onSuccessfulAdd) onSuccessfulAdd(lastSuccessData);
    }

    // 4. افتح الباب تاني بعد ما المزامنة خلصت تماماً والـ Pending اتمسح
    syncLock.current = false;
  }, [getToken, onSuccessfulAdd, onSyncComplete]);

  useEffect(() => {
    const handleOnline = () => syncPendingEntries();
    window.addEventListener("online", handleOnline);

    if (navigator.onLine && readPending().length > 0) {
      syncPendingEntries();
    }

    return () => window.removeEventListener("online", handleOnline);
  }, [syncPendingEntries]);

  const offlineAddWater = useCallback(
    async (amount) => {
      if (!navigator.onLine) {
        queueEntry(amount);
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
          },
        );
        return null;
      }

      try {
        const token = await getToken();
        const response = await axios.post(
          `${BASE_URL}/api/water/add`,
          { amount },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (onSuccessfulAdd) onSuccessfulAdd(response.data);
        toast.success(`Added ${amount}ml of water 💧`);
        return response.data;
      } catch (error) {
        console.error("[useOfflineWater] Online add failed:", error);
        toast.error("Failed to add water. Please try again.");
        throw error;
      }
    },
    [getToken, onSuccessfulAdd],
  );

  return { offlineAddWater, pendingCount };
}
