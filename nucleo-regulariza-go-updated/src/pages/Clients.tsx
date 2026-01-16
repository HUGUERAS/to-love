import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const clients = [
  { name: "Maria Oliveira", contact: "(62) 9 8888-7777", cases: 2 },
  { name: "Fazenda Santa Rita (representante)", contact: "contato@santarita.com", cases: 1 },
];

export default function Clients() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Clientes</h2>
          <p className="text-muted-foreground mt-1">
            Visão rápida dos requerentes. No MVP, esta tela é uma prévia do módulo CRM.
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Lista</CardTitle>
            <CardDescription>Consolidado simples por contato. Confrontantes entram na Fase 2.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.map((c) => (
              <div key={c.name} className="p-3 rounded-lg border bg-background flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.contact}</div>
                </div>
                <Badge variant="outline">{c.cases} caso(s)</Badge>
              </div>
            ))}
            {clients.length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
