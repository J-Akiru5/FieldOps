import { getUserNotifications } from "@/lib/data/notifications";
import { createServerClient } from "@syntaxure/db/server";
import { redirect } from "next/navigation";
import { NotificationsClient } from "./notifications-client";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const notifications = await getUserNotifications(user.id);

  return (
    <NotificationsClient
      notifications={notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        readAt: n.readAt?.toISOString() ?? null,
      }))}
    />
  );
}
