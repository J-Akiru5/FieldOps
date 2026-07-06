"use client";

import { changePassword, updateStaffName } from "@/app/actions/account";
import { Button, Input, Label } from "@syntaxure/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface AccountPageClientProps {
  userName: string;
  userEmail: string;
  userRole: string;
  memberSince: string;
}

export function AccountPageClient({
  userName,
  userEmail,
  userRole,
  memberSince,
}: AccountPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(userName);
  const [nameStatus, setNameStatus] = useState<{ success: boolean; error?: string } | null>(null);
  const [pwStatus, setPwStatus] = useState<{
    success: boolean;
    error?: string;
    message?: string;
  } | null>(null);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSaveName() {
    startTransition(async () => {
      const result = await updateStaffName(name);
      setNameStatus(result);
      if (result.success) router.refresh();
    });
  }

  async function handleChangePassword() {
    startTransition(async () => {
      const result = await changePassword();
      setPwStatus(result);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and security settings
        </p>
      </div>

      <div className="max-w-lg space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">
                Avatar upload available after Supabase Storage is configured
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Profile</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={userEmail} disabled className="mt-1.5 opacity-60" />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={userRole} disabled className="mt-1.5 opacity-60" />
            </div>
            <div>
              <Label>Member Since</Label>
              <Input value={memberSince} disabled className="mt-1.5 opacity-60" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveName} disabled={isPending} size="sm">
              {isPending ? "Saving..." : "Save changes"}
            </Button>
            {nameStatus?.success && <span className="text-sm text-green-500">Name updated</span>}
            {nameStatus?.error && (
              <span className="text-sm text-destructive">{nameStatus.error}</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Security</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Send a password reset link to <strong>{userEmail}</strong>
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={handleChangePassword} disabled={isPending} variant="outline" size="sm">
              {isPending ? "Sending..." : "Send Password Reset"}
            </Button>
            {pwStatus?.success && (
              <span className="text-sm text-green-500">{pwStatus.message}</span>
            )}
            {pwStatus?.error && <span className="text-sm text-destructive">{pwStatus.error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
