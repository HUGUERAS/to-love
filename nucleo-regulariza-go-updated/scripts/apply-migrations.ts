/// <reference types="node" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que .env.local está configurado.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMigrations() {
  console.log('🔍 Verificando estado das migrations...\n');

  try {
    // 1. Verificar se a tabela properties existe
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (propError) {
      if (propError.message.includes('relation "public.properties" does not exist')) {
        console.log('❌ Tabela "properties" NÃO existe');
        console.log('\n📋 Para aplicar as migrations:');
        console.log('1. Acesse: https://supabase.com/dashboard');
        console.log('2. Selecione seu projeto');
        console.log('3. Menu lateral → SQL Editor');
        console.log('4. New Query');
        console.log('5. Copie e cole o conteúdo de:');
        console.log('   supabase/migrations/APPLY_ALL_MIGRATIONS.sql');
        console.log('6. Clique em RUN\n');
        return false;
      }
      throw propError;
    }

    console.log('✅ Tabela "properties" existe');

    // 2. Verificar se a coluna primary_role existe
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, primary_role')
      .limit(1);

    if (profileError) {
      if (profileError.message.includes('column "primary_role" does not exist')) {
        console.log('❌ Coluna "primary_role" NÃO existe no profiles');
        console.log('   Migrations não foram totalmente aplicadas\n');
        return false;
      }
    } else {
      console.log('✅ Coluna "primary_role" existe no profiles');
    }

    // 3. Verificar se a função find_neighbors existe
    const { data: neighbors, error: neighborError } = await supabase
      .rpc('find_neighbors', {
        property_id: '00000000-0000-0000-0000-000000000000',
        distance_meters: 100
      });

    if (neighborError) {
      if (neighborError.message.includes('function public.find_neighbors') && 
          neighborError.message.includes('does not exist')) {
        console.log('❌ Função "find_neighbors" NÃO existe');
        console.log('   Migrations não foram totalmente aplicadas\n');
        return false;
      }
    } else {
      console.log('✅ Função "find_neighbors" existe');
    }

    console.log('\n🎉 Todas as migrations foram aplicadas com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute: npm run dev');
    console.log('2. Acesse: https://localhost:8080/client-map-view');
    console.log('3. Teste salvando uma propriedade');
    
    return true;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('\n❌ Erro ao verificar migrations:', error.message);
    } else {
      console.error('\n❌ Erro desconhecido ao verificar migrations:', error);
    }
    return false;
  }
}

checkMigrations();

