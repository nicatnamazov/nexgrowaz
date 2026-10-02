"use server";

import { supabase } from "@/utils/supabase";

export async function verifyAdmin(email: string, pass: string) {
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  
  if (data) {
    return email === data.admin_email && pass === data.admin_pass;
  }

  // Fallback to defaults if settings table is empty or doesn't exist yet
  return email === "info@nexgrow.az" && pass === "Nicat2026!";
}
