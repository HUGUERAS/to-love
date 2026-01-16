import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSession() {
  return useQuery(['session'], async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  });
}

export function useProfile(userId?: string) {
  return useQuery(['profile', userId], async () => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('workspace_id, role, full_name, primary_role')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }, { enabled: !!userId });
}
