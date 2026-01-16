import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProperties() {
  return useQuery(['properties'], async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*');
    if (error) throw error;
    return data ?? [];
  });
}

export function useFindNeighbors() {
  return useMutation(async ({ property_id, distance_meters }: { property_id: string; distance_meters: number }) => {
    const { data, error } = await supabase
      .rpc('find_neighbors', { property_id, distance_meters });
    if (error) throw error;
    return data;
  });
}
