import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCurrentUser() {
  return useQuery(['currentUser'], async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  });
}

export function useCreateProperty() {
  return useMutation(async (payload: {
    name: string;
    municipality: string;
    objectives: string[];
    objective_other: string | null;
    geom: string;
    owner_id: string;
  }) => {
    const { data, error } = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  });
}
