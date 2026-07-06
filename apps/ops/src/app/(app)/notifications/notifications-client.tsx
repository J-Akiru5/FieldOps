"use client";

import { markNotificationRead } from "@/app/actions/notifications";
import { format } from "date-fns";
import { Bell, BellOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export function NotificationsClient({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Alerts and updates</p>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
            <BellOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No notifications</p>
          <p className="text-xs text-muted-foreground mt-1">You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-colors ${n.readAt ? "bg-card" : "bg-card border-primary/30"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.readAt ? "bg-muted" : "bg-primary/10"}`}
                  >
                    <Bell
                      className={`h-4 w-4 ${n.readAt ? "text-muted-foreground" : "text-primary"}`}
                    />
                  </div>
                  <div>
                    <p className={`text-sm ${n.readAt ? "" : "font-semibold"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(n.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                {!n.readAt && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
