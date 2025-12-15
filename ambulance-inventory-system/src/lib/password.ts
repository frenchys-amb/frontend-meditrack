import { supabase } from "@/lib/supabase";

export async function changeUserPassword(userId: string, newPassword: string) {
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/change-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, newPassword }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "No se pudo cambiar la contraseña");
  }

  return result;
}
