import { cn } from "../../lib/utils";

type StatusVariant =
  | "NEW"
  | "CONTACTED"
  | "CONVERTED"
  | "CLOSED"
  | "SITE"
  | "PHONE"
  | "WALK_IN"
  | string;

const variantMap: Record<string, string> = {
  // InquiryStatus
  NEW: "bg-blue-100 text-blue-800 border-blue-200",
  CONTACTED: "bg-amber-100 text-amber-800 border-amber-200",
  CONVERTED: "bg-green-100 text-green-800 border-green-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
  // InquirySource
  SITE: "bg-indigo-100 text-indigo-800 border-indigo-200",
  PHONE: "bg-purple-100 text-purple-800 border-purple-200",
  WALK_IN: "bg-orange-100 text-orange-800 border-orange-200",
};

const labelMap: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CONVERTED: "Converted",
  CLOSED: "Closed",
  SITE: "Site",
  PHONE: "Phone",
  WALK_IN: "Walk-in",
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = variantMap[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const label = labelMap[status] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
