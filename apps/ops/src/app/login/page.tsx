import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">FieldOps</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with your staff account.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
