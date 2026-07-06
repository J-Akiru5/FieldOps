"use client";

import { saveSettings } from "@/app/actions/settings";
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

interface SettingsInput {
  companyName: string;
  scheduleReminderHours: number;
  lowStockThreshold: number;
  defaultVatType: string;
  workingHoursStart: string;
  workingHoursEnd: string;
}

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<{ success: boolean; error?: string } | null>(null);

  function update(field: keyof SettingsInput, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSettings(form);
      setStatus(result);
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Company configuration and thresholds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <div>
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="scheduleReminderHours">Schedule reminder (hours before)</Label>
          <Input
            id="scheduleReminderHours"
            type="number"
            value={form.scheduleReminderHours}
            onChange={(e) => update("scheduleReminderHours", Number(e.target.value))}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            value={form.lowStockThreshold}
            onChange={(e) => update("lowStockThreshold", Number(e.target.value))}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Default VAT type</Label>
          <Select value={form.defaultVatType} onValueChange={(v) => update("defaultVatType", v)}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VAT_INCLUSIVE">VAT Inclusive</SelectItem>
              <SelectItem value="VAT_EXCLUSIVE">VAT Exclusive</SelectItem>
              <SelectItem value="NON_VAT">Non-VAT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="workingHoursStart">Work start</Label>
            <Input
              id="workingHoursStart"
              type="time"
              value={form.workingHoursStart}
              onChange={(e) => update("workingHoursStart", e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="workingHoursEnd">Work end</Label>
            <Input
              id="workingHoursEnd"
              type="time"
              value={form.workingHoursEnd}
              onChange={(e) => update("workingHoursEnd", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
        {status?.success && <p className="text-sm text-green-500">Settings saved</p>}
        {status?.error && <p className="text-sm text-destructive">{status.error}</p>}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
