"use client";

import { updateInquiryStatus } from "@/app/actions/inquiry";
import { InquiryStatus } from "@syntaxure/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@syntaxure/ui";
import { useTransition } from "react";
import { toast } from "sonner";

interface StatusSelectProps {
  inquiryId: string;
  currentStatus: InquiryStatus;
}

export function StatusSelect({ inquiryId, currentStatus }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      const result = await updateInquiryStatus(inquiryId, value as InquiryStatus);
      if (result.success) toast.success("Status updated");
      else toast.error(result.error ?? "Failed to update status");
    });
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger id={`status-select-${inquiryId}`} className="h-7 w-[130px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={InquiryStatus.NEW}>New</SelectItem>
        <SelectItem value={InquiryStatus.CONTACTED}>Contacted</SelectItem>
        <SelectItem value={InquiryStatus.CONVERTED}>Converted</SelectItem>
        <SelectItem value={InquiryStatus.CLOSED}>Closed</SelectItem>
      </SelectContent>
    </Select>
  );
}
