import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Role = "GESTOR" | "CLIENTE";

export default function RoleRedirect() {
  const [loading, setLoading] = useState(true);
  const [to, setTo] = useState("/auth");

  useEffect(() => {
    let mounted = true;

    async function run() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        if (mounted) {
          setTo("/auth");
          setLoading(false);
        }
        return;
      }

      const userId = session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("primary_role")
        .eq("id", userId)
        .single();

      const role = (profile?.primary_role ?? null) as Role | null;

      if (!mounted) return;

      if (role === "GESTOR") setTo("/dashboard");
      else if (role === "CLIENTE") setTo("/cliente");
      else setTo("/onboarding");

      setLoading(false);
    }

    run();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;
  return <Navigate to={to} replace />;
}
