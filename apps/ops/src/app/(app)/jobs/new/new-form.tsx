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
import { toast } from "sonner";

interface NewJobFormProps {
  customers: {
    id: string;
    displayName: string;
    appliances: { id: string; brand: string | null; model: string | null }[];
  }[];
  technicians: { id: string; name: string }[];
}

const jobTypes = ["MAINTENANCE", "REPAIR", "INSTALLATION"];

export function NewJobForm({ customers, technicians: _technicians }: NewJobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState("");
  const [applianceId, setApplianceId] = useState("");
  const [type, setType] = useState("REPAIR");
  const [scheduledAt, setScheduledAt] = useState("");
  const [laborFee, setLaborFee] = useState("");

  const selectedCustomer = customers.find((c) => c.id === customerId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !type || !scheduledAt) {
      toast.error("Customer, type, and schedule date are required");
      return;
    }
    startTransition(async () => {
      const result = await createJobAction({
        customerId,
        applianceId: applianceId || undefined,
        type,
        scheduledAt: new Date(scheduledAt).toISOString(),
        laborFee: laborFee ? Number(laborFee) : undefined,
      });
      if (result.success) {
        toast.success("Job created successfully");
        router.push("/jobs");
      } else {
        toast.error(result.error ?? "Failed to create job");
      }
    });
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Job</h1>
        <p className="text-sm text-muted-foreground mt-1">Schedule a service job</p>
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
                  {c.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCustomer?.appliances.length ? (
          <div>
            <Label>Appliance</Label>
            <Select value={applianceId} onValueChange={setApplianceId}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select appliance (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {selectedCustomer.appliances.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.brand} {a.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
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
          <Label htmlFor="scheduledAt">Scheduled date/time *</Label>
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
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating..." : "Create job"}
        </Button>
      </form>
    </div>
  );
}
