import { createServerClient } from "@syntaxure/db/server";

export async function requireAuth() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: must be signed in");
  }

  return user;
}
