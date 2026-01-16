import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Templates() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Templates SEAPA</h2>
          <p className="text-muted-foreground mt-1">
            No MVP, o questionário utiliza um template fixo SEAPA-GO. Customização e versões entram na Fase 2.
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Template Base — SEAPA (GO)
              <Badge variant="outline">Fixo no MVP</Badge>
            </CardTitle>
            <CardDescription>
              Seções: Identificação do requerente, Identificação do imóvel/posse, Histórico/posse, Confrontações e Declarações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              O objetivo do template é padronizar a coleta inicial para reduzir retrabalho na elaboração das peças técnicas.
            </div>
            <div className="text-sm text-muted-foreground">
              Próximos passos (Fase 2): criação de variações por município, campos obrigatórios configuráveis e controle de versões.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
