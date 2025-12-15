// lib/admin.ts
import { supabase } from "@/lib/supabase";

// ------------------------------------------
// GET ALL USERS
// ------------------------------------------
export async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ------------------------------------------
// CREATE NEW USER (via Edge Function)
// ------------------------------------------
export async function createNewUser(
  email: string,
  password: string,
  username: string,
  extraData: any
) {
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    return { success: false, message: result.error };
  }

  return { success: true };
}

// ------------------------------------------
// UPDATE USER (via Edge Function)
// ------------------------------------------
export async function updateUser(
  id: string,
  updates: {
    username?: string;
    full_name?: string;
    role?: "admin" | "paramedic";
  }
) {
  // 1. Obtener el token del usuario logueado (aunque la Edge Function no lo requiere ahora)
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  // 2. Llamar a la Edge Function
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Incluimos el token por si en el futuro reactivamos JWT Verify
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        userId: id,
        updates: updates,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    // Manejo especial del error 409 (nombre de usuario duplicado)
    if (response.status === 409) {
      throw new Error(result.message || "Ese nombre de usuario ya está en uso.");
    }

    // Otros errores
    throw new Error(result.error || "No se pudo actualizar el usuario");
  }

  return true;
}

// ------------------------------------------
// DELETE USER (via Edge Function)
// ------------------------------------------
export async function deleteUser(id: string) {
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
