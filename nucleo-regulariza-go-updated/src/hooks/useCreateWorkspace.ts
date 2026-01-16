import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCreateWorkspace() {
  return useMutation(async (payload: {
    workspace_name: string;
    responsible_name: string;
    uf_default?: string;
    link_expiration?: number;
    whatsapp_template?: string;
  }) => {
    const { data, error } = await supabase.rpc('create_workspace_admin', payload);
    if (error || !data) throw error || new Error('Erro ao criar workspace');
    return data;
  });
}
