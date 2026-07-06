"use server";

import { requireAuth } from "@/lib/auth-guard";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function uploadAvatar(
  formData: FormData
): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    const userId = await requireAuth();
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return {
        success: false,
        error: "Storage not configured — ask an admin to set SUPABASE_SERVICE_ROLE_KEY",
      };
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

    revalidatePath("/account");
    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload avatar",
    };
  }
}
