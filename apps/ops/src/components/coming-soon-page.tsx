import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface ComingSoonPageProps {
  icon: LucideIcon;
  title: string;
}

export function ComingSoonPage({ icon: Icon, title }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-sm">
        This feature is planned for a future phase. Check back soon!
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
