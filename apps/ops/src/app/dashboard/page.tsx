import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">FieldOps Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome, {user.email}. The dashboard is coming in Phase 2.
        </p>
      </div>
    </main>
  );
}
