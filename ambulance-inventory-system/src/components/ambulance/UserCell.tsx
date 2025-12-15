// Esto es del AmbulanceDetailPage
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface UserCellProps {
  userId: string;
}

export const UserCell = ({ userId }: UserCellProps) => {
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUserName = async () => {
      if (!userId) {
        if (isMounted) {
          setName("-");
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", userId)
          .maybeSingle();

        const user = data as any;

        if (isMounted) {
          if (user && user.full_name) {
            setName(user.full_name);
          } else {
            setName("Usuario Desconocido");
          }
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        if (isMounted) setName("Error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserName();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return <Loader2 className="h-3 w-3 animate-spin text-slate-400" />;
  }

  return (
    <span className="font-medium text-slate-700 capitalize">
      {name}
    </span>
  );
};