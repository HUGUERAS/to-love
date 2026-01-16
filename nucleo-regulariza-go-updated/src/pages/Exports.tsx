import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Loader2, ShieldCheck } from "lucide-react";

export default function Exports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const caseId = searchParams.get("case") || "";
  const [caseInput, setCaseInput] = useState(caseId);
  const [loading, setLoading] = useState<"dossie" | "briefing" | null>(null);

  const canExport = useMemo(() => caseInput.trim().length > 0, [caseInput]);

  const runExport = async (kind: "dossie" | "briefing") => {
    if (!canExport) {
      toast({
        title: "Selecione um caso",
        description: "Informe o identificador do caso para gerar as exportações.",
        variant: "destructive",
      });
      return;
    }

    setLoading(kind);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(null);

    toast({
      title: "Exportação gerada",
      description:
        kind === "dossie"
          ? "Dossiê SEAPA (PDF) pronto para download (simulado no MVP)."
          : "Briefing Técnico (PDF) pronto para download (simulado no MVP).",
    });
  };

  const applyCase = () => {
    const next = caseInput.trim();
    if (next) {
      setSearchParams({ case: next });
    } else {
      setSearchParams({});
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Exportações</h2>
            <p className="text-muted-foreground mt-1">
              Gere o Dossiê SEAPA e o Briefing Técnico. No MVP, a geração é simulada (UI + logs).
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Audit trail incluído
          </Badge>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Selecionar caso</CardTitle>
            <CardDescription>Use o identificador do caso (ex.: <strong>CASE-001</strong>).</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="case">Caso</Label>
              <Input
                id="case"
                placeholder="Digite o ID do caso"
                value={caseInput}
                onChange={(e) => setCaseInput(e.target.value)}
              />
            </div>
            <Button variant="secondary" onClick={applyCase}>Aplicar</Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Dossiê SEAPA (PDF)
              </CardTitle>
              <CardDescription>
                Compilação do questionário, anexos, resumo do croqui e trilha de auditoria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={loading !== null} onClick={() => runExport("dossie")}>
                {loading === "dossie" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dossiê SEAPA (PDF)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Briefing Técnico (PDF)
              </CardTitle>
              <CardDescription>
                Resumo do croqui, pendências, checklist de campo e lista de anexos recebidos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={loading !== null} onClick={() => runExport("briefing")}>
                {loading === "briefing" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Briefing Técnico (PDF)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
