import { supabase } from "./supabase";

export const isAdminUser = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.log("SUPABASE ERROR:", error);
    return false;
  }

  return data?.role === "admin";
};