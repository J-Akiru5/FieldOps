import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { NewScheduleForm } from "./new-form";

export default async function NewSchedulePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <NewScheduleForm />;
}
