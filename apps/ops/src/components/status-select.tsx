"use client";

import { updateInquiryStatus } from "@/app/actions/inquiry";
import { InquiryStatus } from "@syntaxure/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@syntaxure/ui";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface StatusSelectProps {
  inquiryId: string;
  currentStatus: InquiryStatus;
}

export function StatusSelect({ inquiryId, currentStatus }: StatusSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      const result = await updateInquiryStatus(inquiryId, value as InquiryStatus);
      if (result.success) router.refresh();
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
