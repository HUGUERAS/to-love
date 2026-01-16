import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  FileText,
  Upload,
  Check,
  AlertCircle,
  Send,
  Loader2,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/hooks/useNotifications";

// Mock summary data
const mockSummary = {
  croqui: {
    status: "complete",
    area: "52.3 ha",
    vertices: 8,
    referencias: "Divisa com Fazenda Boa Vista ao Norte, estrada vicinal ao Sul",
    version: 2,
  },
  questionario: {
    status: "complete",
    progress: 95,
    pendingFields: ["E-mail"],
  },
  documentos: {
    status: "incomplete",
    uploaded: 3,
    recommended: 5,
    categories: {
      identificacao: 2,
      posse: 1,
      imovel: 0,
      mapas: 0,
    }
  },
};

const PortalRevisao = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const summary = mockSummary;

  // Check if ready to submit
  const canSubmit = summary.croqui.status === "complete" && 
                    summary.questionario.status === "complete";

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Create notification for topographer
    await createNotification({
      case_id: caseId || '1',
      case_name: 'Fazenda Santa Maria',
      type: 'case_submitted',
      title: 'Dossiê enviado para revisão',
      message: 'O cliente finalizou o preenchimento e enviou o dossiê para sua análise.',
      metadata: {
        croqui_complete: summary.croqui.status === 'complete',
        questionario_progress: summary.questionario.progress,
        documents_count: summary.documentos.uploaded
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Dossiê enviado!",
      description: "O topógrafo irá revisar seus dados e entrará em contato.",
    });
  };

  if (isSubmitted) {
    return (
      <PortalLayout caseName="Fazenda Santa Maria">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <Check className="w-10 h-10 text-success" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Dossiê enviado!</h2>
            <p className="text-muted-foreground max-w-sm">
              O topógrafo irá revisar seus dados e documentos. 
              Você receberá uma notificação caso seja necessário complementar algo.
            </p>
          </div>

          <Card className="w-full bg-secondary/30">
            <CardContent className="p-4 text-left">
              <h4 className="font-medium text-foreground mb-2">Próximos passos</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">1</span>
                  Revisão pelo topógrafo (1-3 dias úteis)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">2</span>
                  Solicitação de pendências (se houver)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">3</span>
                  Elaboração das peças técnicas
                </li>
              </ol>
            </CardContent>
          </Card>

          <Button onClick={() => navigate(`/portal/${caseId}`)} className="gap-2">
            Voltar ao início
          </Button>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Revisão e Envio" showBack caseName="Fazenda Santa Maria">
      <div className="space-y-4 pb-28">
        {/* Warning if not ready */}
        {!canSubmit && (
          <Card className="bg-warning/5 border-warning/30">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Complete as etapas obrigatórias</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Você precisa concluir o croqui e o questionário antes de enviar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Croqui summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  summary.croqui.status === "complete" ? "bg-success/10" : "bg-warning/10"
                }`}>
                  {summary.croqui.status === "complete" ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <MapPin className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Croqui no Mapa</h4>
                  <p className="text-xs text-muted-foreground">Versão {summary.croqui.version}</p>
                </div>
              </div>
              <Badge variant={summary.croqui.status === "complete" ? "complete" : "pending"}>
                {summary.croqui.status === "complete" ? "Concluído" : "Pendente"}
              </Badge>
            </div>

            {summary.croqui.status === "complete" && (
              <div className="p-3 rounded-lg bg-secondary/50">
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Área aproximada:</dt>
                    <dd className="font-medium">{summary.croqui.area}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Vértices:</dt>
                    <dd className="font-medium">{summary.croqui.vertices}</dd>
                  </div>
                  <div className="pt-1">
                    <dt className="text-muted-foreground mb-1">Referências:</dt>
                    <dd className="text-foreground">{summary.croqui.referencias}</dd>
                  </div>
                </dl>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 gap-1"
              onClick={() => navigate(`/portal/${caseId}/croqui`)}
            >
              {summary.croqui.status === "complete" ? "Editar" : "Completar"} croqui
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Questionário summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  summary.questionario.status === "complete" ? "bg-success/10" : "bg-warning/10"
                }`}>
                  {summary.questionario.status === "complete" ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <FileText className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Questionário SEAPA</h4>
                  <p className="text-xs text-muted-foreground">{summary.questionario.progress}% preenchido</p>
                </div>
              </div>
              <Badge variant={summary.questionario.status === "complete" ? "complete" : "pending"}>
                {summary.questionario.status === "complete" ? "Concluído" : "Pendente"}
              </Badge>
            </div>

            {summary.questionario.pendingFields.length > 0 && (
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-2">Campos opcionais não preenchidos:</p>
                <div className="flex flex-wrap gap-1">
                  {summary.questionario.pendingFields.map((field, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 gap-1"
              onClick={() => navigate(`/portal/${caseId}/questionario`)}
            >
              {summary.questionario.status === "complete" ? "Revisar" : "Completar"} questionário
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Documentos summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Documentos</h4>
                  <p className="text-xs text-muted-foreground">
                    {summary.documentos.uploaded} de {summary.documentos.recommended} recomendados
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                Opcional
              </Badge>
            </div>

            <div className="p-3 rounded-lg bg-secondary/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Identificação:</span>
                  <span className="font-medium">{summary.documentos.categories.identificacao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posse:</span>
                  <span className="font-medium">{summary.documentos.categories.posse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Imóvel:</span>
                  <span className="font-medium">{summary.documentos.categories.imovel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mapas:</span>
                  <span className="font-medium">{summary.documentos.categories.mapas}</span>
                </div>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 gap-1"
              onClick={() => navigate(`/portal/${caseId}/documentos`)}
            >
              Gerenciar documentos
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Submit section */}
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <Send className="w-8 h-8 text-primary mx-auto" />
              <div>
                <h4 className="font-semibold text-foreground">Pronto para enviar?</h4>
                <p className="text-sm text-muted-foreground">
                  O topógrafo irá revisar seus dados e entrará em contato.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fixed submit button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="container max-w-lg mx-auto">
            <Button 
              className="w-full gap-2" 
              size="lg"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar para revisão
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalRevisao;
