export const CALENDAR_START_HOUR = 6;
export const CALENDAR_END_HOUR = 20;
export const HOUR_HEIGHT = 84;
export const DAY_MINUTES = 60;

export const JOB_TYPE_COLORS: Record<
  string,
  { border: string; bg: string; text: string; dot: string; label: string }
> = {
  INSTALLATION: {
    border: "border-l-blue-500",
    bg: "bg-blue-50/80",
    text: "text-blue-900",
    dot: "bg-blue-500",
    label: "Installation",
  },
  REPAIR: {
    border: "border-l-rose-500",
    bg: "bg-rose-50/80",
    text: "text-rose-900",
    dot: "bg-rose-500",
    label: "Repair",
  },
  MAINTENANCE: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50/80",
    text: "text-emerald-900",
    dot: "bg-emerald-500",
    label: "Maintenance",
  },
};

export const DEFAULT_COLOR = {
  border: "border-l-amber-500",
  bg: "bg-amber-50/80",
  text: "text-amber-900",
  dot: "bg-amber-500",
  label: "Others",
};

export function getJobTypeColor(type: string) {
  return JOB_TYPE_COLORS[type] ?? DEFAULT_COLOR;
}

export function getTypeLabel(type: string) {
  return getJobTypeColor(type).label;
}
