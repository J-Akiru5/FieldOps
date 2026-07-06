import { Users } from "lucide-react";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage team members and roles</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No staff members</p>
        <p className="text-xs text-muted-foreground mt-1">
          Invite team members to start collaborating.
        </p>
      </div>
    </div>
  );
}
