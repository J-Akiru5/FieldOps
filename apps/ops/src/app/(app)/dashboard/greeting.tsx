"use client";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardGreeting({ firstName }: { firstName: string }) {
  const greeting = getGreeting();
  return (
    <div>
      <p className="text-sm text-muted-foreground font-medium">
        {greeting}, {firstName}!
      </p>
      <h1 className="text-2xl font-bold tracking-tight mt-0.5">Dashboard</h1>
    </div>
  );
}
