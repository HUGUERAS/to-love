# Núcleo Regulariza GO - Diretrizes para Agentes de IA

## Visão Geral do Projeto
Este é um sistema de gestão de regularização fundiária para Goiás, Brasil, construído com React/TypeScript. Atende dois tipos de usuários:
- **Dashboard**: Topógrafos internos gerenciando casos
- **Portal**: Clientes externos enviando e acompanhando suas solicitações de regularização

## Arquitetura e Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Componentes shadcn/ui com Tailwind CSS (tema slate, variáveis CSS)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Estado**: React Query para estado do servidor, estado local com useState
- **Roteamento**: React Router v6 com rotas aninhadas
- **Mapas**: Mapbox GL JS para croqui (mapeamento de lotes)
- **Formulários**: React Hook Form + validação Zod

## Padrões e Convenções Principais

### Estrutura de Componentes
- Usar componentes shadcn/ui de `@/components/ui/*`
- Componentes de layout: `DashboardLayout` (interno) vs `PortalLayout` (cliente)
- Páginas em `/src/pages/` com organização baseada em funcionalidades
- Hooks customizados em `/src/hooks/` para lógica reutilizável

### Busca de Dados
```typescript
// Sempre usar React Query para dados do servidor
import { useQuery } from "@tanstack/react-query";

const { data, isLoading } = useQuery({
  queryKey: ["cases"],
  queryFn: () => supabase.from("cases").select("*")
});
```

### Integração com Supabase
- Cliente inicializado em `@/integrations/supabase/client.ts`
- Tipos gerados automaticamente em `@/integrations/supabase/types.ts`
- Assinaturas em tempo real para notificações
- Row Level Security habilitado em todas as tabelas

### Sistema de Notificações
- Notificações em tempo real via Supabase
- Tipos: 'croqui_updated', 'document_uploaded', 'form_updated', 'case_submitted', 'pendency_resolved'
- Destinatários: 'topographer' ou 'client'
- Usar hook `useNotifications` para gerenciamento de estado

### Integração com Mapas
- Token Mapbox de variável de ambiente `VITE_MAPBOX_TOKEN`
- Componente CroquiMap para desenho de lotes
- Centro padrão: coordenadas do estado de Goiás [-49.2648, -16.6869]
- Usa @mapbox/mapbox-gl-draw para edição de polígonos

### Variáveis de Ambiente
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_MAPBOX_TOKEN`

### Build e Desenvolvimento
- `npm run dev`: Servidor de desenvolvimento Vite com HTTPS
- `npm run build`: Build de produção
- `npm run lint`: ESLint com regras TypeScript
- Dados mock usados extensivamente no desenvolvimento

### Convenção de UI em Português
- Todo texto voltado ao usuário em português
- Labels de componentes, navegação e mensagens
- Comentários no código podem ser em inglês ou português

## Organização de Arquivos
```
src/
├── components/
│   ├── ui/           # componentes shadcn/ui
│   ├── layout/       # DashboardLayout, PortalLayout
│   ├── map/          # CroquiMap, utilitários de mapa
│   └── notifications/# NotificationDropdown
├── pages/            # componentes de rota
│   ├── portal/       # páginas voltadas ao cliente
│   └── *.tsx         # páginas do dashboard
├── hooks/            # hooks React customizados
├── integrations/     # clientes de serviços externos
└── lib/              # utilitários (utils.ts)
```

## Melhorias Recentes (2026)
- **Autenticação funcional**: Sistema de login/signup básico implementado (localStorage temporário até Supabase)
- **Navegação aprimorada**: Cards do dashboard agora são clicáveis e levam para páginas relevantes
- **Onboarding melhorado**: Botão "Voltar ao início" mais claro na página de configuração
- **Funcionalidades básicas**: Copiar link do portal, abrir portal do cliente, navegação entre casos

## Tarefas Comuns
- **Criar novo caso**: Dashboard → "Novo Caso" → Preencher formulário de 4 passos → Redireciona para revisão
- **Revisar caso**: Lista de casos → Clicar no nome → Página de revisão com abas (Croqui, Questionário, Documentos)
- **Acessar portal do cliente**: Menu de ações do caso → "Abrir portal do cliente" → Nova aba
- **Exportar dossiê**: Casos prontos → Menu de ações → "Exportar dossiê" → Página de exportações
- **Gerenciar pendências**: Dashboard → Card "Pendências abertas" → Listar e resolver pendências

## Verificações de Qualidade
- Executar `npm run lint` antes dos commits
- Testar funcionalidade de mapa com token Mapbox válido
- Verificar se notificações em tempo real funcionam
- Verificar design responsivo em dispositivos móveis</content>
<parameter name="filePath">.github/copilot-instructions.md