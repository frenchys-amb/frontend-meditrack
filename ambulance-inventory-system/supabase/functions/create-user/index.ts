// lib/admin.ts
import { supabase } from "@/lib/supabase";

/* =======================================================
   GET ALL USERS
======================================================= */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/* =======================================================
   CREATE NEW USER — via Edge Function (create-user)
======================================================= */
export async function createNewUser(
  email: string,
  password: string,
  username: string,
  extraData: any
) {
  try {
    // ❗ Usamos Service Role Key — solo Edge puede usarla
    const SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!SERVICE_KEY) {
      return {
        success: false,
        message: "Falta VITE_SUPABASE_SERVICE_ROLE_KEY en el .env",
      };
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_KEY}`, // 🔥 CLAVE CORRECTA
        },
        body: JSON.stringify({
          email,
          password,
          username,
          full_name: extraData.full_name,
          role: extraData.role,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.error || "Error creando usuario" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/* =======================================================
   UPDATE USER (solo tabla users)
======================================================= */
export async function updateUser(
  id: string,
  updates: {
    username?: string;
    full_name?: string;
    role?: "admin" | "paramedic";
  }
) {
  const { error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  return true;
}

/* =======================================================
   DELETE USER — via Edge Function (delete-user)
======================================================= */
export async function deleteUser(id: string) {
  const SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_KEY) {
    throw new Error("Falta VITE_SUPABASE_SERVICE_ROLE_KEY en .env");
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ id }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "No se pudo eliminar el usuario");
  }

  return true;
}
