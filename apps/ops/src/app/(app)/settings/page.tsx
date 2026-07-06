import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure company preferences and thresholds
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
          <Settings className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Settings panel</p>
        <p className="text-xs text-muted-foreground mt-1">
          Notification thresholds, company info, and VAT defaults coming soon.
        </p>
      </div>
    </div>
  );
}
