"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineStatus() {
  const [offline, setOffline] = useState(false);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    function update() {
      setOffline(!navigator.onLine);
    }
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    try {
      setQueued(JSON.parse(localStorage.getItem("fieldops-offline-queue") ?? "[]").length);
    } catch {
      /* ignore */
    }

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline && queued === 0) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${offline ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white"}`}
    >
      {offline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
      {offline
        ? "You are offline. Data will sync when connection is restored."
        : `${queued} action(s) pending sync`}
    </div>
  );
}
