
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession, useProfile } from '@/hooks/useSessionProfile';

type Role = "GESTOR" | "CLIENTE";

export default function RequireRole({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { data: session, isLoading: loadingSession } = useSession();
  const { data: profile, isLoading: loadingProfile } = useProfile(session?.user?.id);
  const loading = loadingSession || loadingProfile;
  const role = profile?.primary_role ?? null;

  if (loading) return null;

  console.log('[RequireRole] allowed:', allowed, 'role:', role);

  if (!session) {
    console.log('[RequireRole] Sem sessão, redirecionando para /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!role || !allowed.includes(role)) {
    console.log('[RequireRole] Papel não permitido ou ausente, redirecionando para /');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
