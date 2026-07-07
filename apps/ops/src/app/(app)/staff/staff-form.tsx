"use client";

import { inviteStaff, removeStaff, updateStaffRole } from "@/app/actions/staff";
import { hasPermission } from "@/lib/permissions";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@syntaxure/ui";
import { Shield, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  authUserId: string;
  createdAt: string;
}

interface StaffPageClientProps {
  staffMembers: StaffMember[];
  currentUserRole?: string;
  currentUserEmail: string | null;
}

const ROLES = ["OWNER", "PARTNER", "BOOKKEEPER", "TECHNICIAN"];

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  PARTNER: "Partner",
  BOOKKEEPER: "Bookkeeper",
  TECHNICIAN: "Technician",
};

export function StaffPageClient({
  staffMembers,
  currentUserRole,
  currentUserEmail,
}: StaffPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("TECHNICIAN");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const canManageStaff = hasPermission(currentUserRole, "staff.write", currentUserEmail);

  async function handleInvite() {
    if (!inviteEmail || !inviteName) {
      toast.error("Name and email are required");
      return;
    }
    startTransition(async () => {
      const result = await inviteStaff(
        inviteEmail,
        inviteName,
        inviteRole as "OWNER" | "PARTNER" | "BOOKKEEPER" | "TECHNICIAN"
      );
      if (result.success) {
        toast.success(`${inviteName} added to staff`);
        setInviteEmail("");
        setInviteName("");
        setShowInvite(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to add staff");
      }
    });
  }

  async function handleRoleChange(staffId: string, newRole: string) {
    startTransition(async () => {
      const result = await updateStaffRole(
        staffId,
        newRole as "OWNER" | "PARTNER" | "BOOKKEEPER" | "TECHNICIAN"
      );
      if (result.success) toast.success("Role updated");
      else toast.error(result.error ?? "Failed to update role");
    });
  }

  async function handleConfirmRemove() {
    if (!confirmRemoveId) return;
    setRemoving(true);
    startTransition(async () => {
      const result = await removeStaff(confirmRemoveId);
      if (result.success) {
        toast.success("Staff member removed");
        setConfirmRemoveId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to remove staff");
        setConfirmRemoveId(null);
      }
      setRemoving(false);
    });
  }

  const removingStaff = staffMembers.find((s) => s.id === confirmRemoveId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members and roles</p>
        </div>
        {canManageStaff && (
          <Button onClick={() => setShowInvite(!showInvite)} size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            {showInvite ? "Cancel" : "Invite staff"}
          </Button>
        )}
      </div>

      {showInvite && (
        <div className="rounded-xl border bg-card p-6 space-y-4 max-w-md">
          <h2 className="text-sm font-semibold">Invite new staff member</h2>
          <div>
            <Label htmlFor="invite-name">Full name</Label>
            <Input
              id="invite-name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="mt-1.5"
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div>
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mt-1.5"
              placeholder="juan@example.com"
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInvite} disabled={isPending} size="sm">
            {isPending ? "Adding..." : "Add staff"}
          </Button>
        </div>
      )}

      {staffMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No staff members</p>
          <p className="text-xs text-muted-foreground mt-1">Invite team members to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                  User ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                {canManageStaff && (
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((staff) => (
                <tr
                  key={staff.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{staff.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                    {staff.authUserId}
                  </td>
                  <td className="px-4 py-3">
                    {canManageStaff ? (
                      <Select
                        value={staff.role}
                        onValueChange={(v) => handleRoleChange(staff.id, v)}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                        {ROLE_LABELS[staff.role] ?? staff.role}
                      </span>
                    )}
                  </td>
                  {canManageStaff && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmRemoveId(staff.id)}
                        disabled={isPending}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!confirmRemoveId} onOpenChange={(open) => !open && setConfirmRemoveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove staff member?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{removingStaff?.name}</strong> from the team?
              They will lose access to the app. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemoveId(null)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove} disabled={removing}>
              {removing ? "Removing..." : "Yes, remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
