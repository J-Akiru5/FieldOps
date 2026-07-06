"use client";

import { createJobAction } from "@/app/actions/jobs";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@syntaxure/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const jobTypes = ["MAINTENANCE", "REPAIR", "INSTALLATION"];

export function NewScheduleForm({ customers }: { customers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState("");
  const [type, setType] = useState("REPAIR");
  const [scheduledAt, setScheduledAt] = useState("");
  const [laborFee, setLaborFee] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !scheduledAt) {
      setError("Customer and schedule date are required");
      return;
    }
    startTransition(async () => {
      const result = await createJobAction({
        customerId,
        type,
        scheduledAt: new Date(scheduledAt).toISOString(),
        laborFee: laborFee ? Number(laborFee) : undefined,
      });
      if (result.success) router.push("/schedule");
      else setError(result.error ?? "Failed to schedule");
    });
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Service Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">Register a new service appointment</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <div>
          <Label>Customer *</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Job type *</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="scheduledAt">Date & time *</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="laborFee">Labor fee (₱)</Label>
          <Input
            id="laborFee"
            type="number"
            step="0.01"
            value={laborFee}
            onChange={(e) => setLaborFee(e.target.value)}
            className="mt-1.5"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Scheduling..." : "Schedule service"}
        </Button>
      </form>
    </div>
  );
}
