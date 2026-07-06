import { getSettings } from "@/lib/data/settings";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const settings = await getSettings();

  return (
    <SettingsForm
      initial={{
        companyName: settings.companyName,
        scheduleReminderHours: settings.scheduleReminderHours,
        lowStockThreshold: settings.lowStockThreshold,
        defaultVatType: settings.defaultVatType,
        workingHoursStart: settings.workingHoursStart,
        workingHoursEnd: settings.workingHoursEnd,
      }}
    />
  );
}
