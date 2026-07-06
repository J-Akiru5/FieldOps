import { createServerClient } from "@syntaxure/db/server";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class DbUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DbUnavailableError";
  }
}

export async function requireAuth(): Promise<string> {
  let user: { id: string } | null = null;
  try {
    const supabase = await createServerClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    throw new AuthError("Authentication service unavailable");
  }

  if (!user) {
    throw new AuthError("Unauthorized: must be signed in");
  }

  return user.id;
}
