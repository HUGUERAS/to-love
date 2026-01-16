import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

const items = [
  {
    id: "PEND-003",
    case: "CASE-004",
    title: "Anexar documento de posse",
    status: "aberta" as const,
    due: "Hoje",
  },
  {
    id: "PEND-002",
    case: "CASE-002",
    title: "Confirmar confrontações (lista)",
    status: "aberta" as const,
    due: "3 dias",
  },
  {
    id: "PEND-001",
    case: "CASE-001",
    title: "Revisar croqui: pontos de referência",
    status: "concluída" as const,
    due: "—",
  },
];

export default function Pending() {
  const open = items.filter((i) => i.status === "aberta");
  const done = items.filter((i) => i.status === "concluída");

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Pendências</h2>
          <p className="text-muted-foreground mt-1">
            Solicite complementações ao cliente e acompanhe o andamento por caso.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Abertas
                <Badge variant="active" className="ml-1">{open.length}</Badge>
              </CardTitle>
              <CardDescription>Itens aguardando cliente ou revisão interna.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {open.map((i) => (
                <div key={i.id} className="p-3 rounded-lg border bg-background flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{i.case}</Badge>
                      <span className="text-sm font-medium">{i.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Prazo: {i.due}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Ver</Button>
                </div>
              ))}
              {open.length === 0 && (
                <div className="text-sm text-muted-foreground">Nenhuma pendência aberta.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Concluídas
                <Badge variant="outline" className="ml-1">{done.length}</Badge>
              </CardTitle>
              <CardDescription>Histórico de complementações já atendidas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {done.map((i) => (
                <div key={i.id} className="p-3 rounded-lg border bg-background flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{i.case}</Badge>
                      <span className="text-sm font-medium">{i.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Status: concluída</div>
                  </div>
                  <Button variant="ghost" size="sm">Detalhes</Button>
                </div>
              ))}
              {done.length === 0 && (
                <div className="text-sm text-muted-foreground">Ainda não há itens concluídos.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
