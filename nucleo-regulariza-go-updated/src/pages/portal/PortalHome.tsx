import { useNavigate, useParams } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  FileText, 
  Upload, 
  Send,
  Check,
  ChevronRight,
  AlertCircle,
  Clock
} from "lucide-react";

// Mock case data - will come from API
const mockCaseData = {
  id: "case_123",
  name: "Fazenda Santa Maria",
  municipality: "Cristalina",
  clientName: "José Santos",
  topographerName: "Topografia Silva",
  topographerPhone: "(62) 99999-0000",
  status: "in_progress",
  createdAt: "2024-01-10",
  steps: {
    croqui: { status: "incomplete", progress: 0 },
    questionario: { status: "incomplete", progress: 0 },
    documentos: { status: "incomplete", progress: 0, uploaded: 0, recommended: 5 },
    revisao: { status: "locked", progress: 0 },
  },
  pendingItems: [
    { id: "1", title: "Documento de identidade com foto", createdAt: "2024-01-12" }
  ]
};

const stepConfig = [
  {
    id: "croqui",
    title: "Croqui no Mapa",
    description: "Desenhe ou importe o polígono do imóvel",
    icon: MapPin,
    route: "/croqui",
    required: true,
  },
  {
    id: "questionario",
    title: "Questionário SEAPA",
    description: "Preencha as informações do requerente e imóvel",
    icon: FileText,
    route: "/questionario",
    required: true,
  },
  {
    id: "documentos",
    title: "Documentos",
    description: "Anexe documentos de identificação e comprovação",
    icon: Upload,
    route: "/documentos",
    required: false,
  },
  {
    id: "revisao",
    title: "Revisão e Envio",
    description: "Revise tudo e envie para o topógrafo",
    icon: Send,
    route: "/revisao",
    required: true,
  },
];

const getStepStatus = (stepId: string, steps: typeof mockCaseData.steps) => {
  const step = steps[stepId as keyof typeof steps];
  if (!step) return { status: "incomplete", progress: 0 };
  return step;
};

const getStatusBadge = (status: string, required: boolean) => {
  switch (status) {
    case "complete":
      return <Badge variant="complete" className="gap-1"><Check className="w-3 h-3" /> Concluído</Badge>;
    case "in_progress":
      return <Badge variant="active" className="gap-1"><Clock className="w-3 h-3" /> Em andamento</Badge>;
    case "locked":
      return <Badge variant="secondary">Bloqueado</Badge>;
    default:
      return required 
        ? <Badge variant="pending" className="gap-1">Obrigatório</Badge>
        : <Badge variant="secondary">Recomendado</Badge>;
  }
};

const PortalHome = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const caseData = mockCaseData; // Will be fetched from API

  // Calculate overall progress
  const completedSteps = Object.values(caseData.steps).filter(s => s.status === "complete").length;
  const totalSteps = stepConfig.filter(s => s.required).length;
  const overallProgress = Math.round((completedSteps / totalSteps) * 100);

  // Check if can proceed to review
  const canReview = caseData.steps.croqui.status === "complete" && 
                    caseData.steps.questionario.status === "complete";

  return (
    <PortalLayout caseName={caseData.name}>
      <div className="space-y-6 pb-20">
        {/* Welcome section */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            Olá, {caseData.clientName.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground">
            Complete as etapas abaixo para enviar seu dossiê ao topógrafo.
          </p>
        </div>

        {/* Overall progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progresso geral</span>
              <span className="text-sm text-muted-foreground">{completedSteps} de {totalSteps} etapas</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {overallProgress === 100 
                ? "Pronto para enviar! Clique em Revisão e Envio." 
                : "Complete as etapas obrigatórias para enviar."}
            </p>
          </CardContent>
        </Card>

        {/* Pending items from topographer */}
        {caseData.pendingItems.length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm">Pendências do topógrafo</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {caseData.pendingItems.length} item(ns) solicitado(s)
                  </p>
                  <ul className="mt-2 space-y-1">
                    {caseData.pendingItems.map((item) => (
                      <li key={item.id} className="text-sm text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                        {item.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steps checklist */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Etapas
          </h3>

          {stepConfig.map((step, index) => {
            const stepStatus = getStepStatus(step.id, caseData.steps);
            const isLocked = stepStatus.status === "locked";
            const isComplete = stepStatus.status === "complete";

            // Lock review if prerequisites not met
            const isReviewLocked = step.id === "revisao" && !canReview;

            return (
              <Card 
                key={step.id}
                className={`transition-all ${
                  isLocked || isReviewLocked
                    ? "opacity-50 cursor-not-allowed" 
                    : "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                }`}
                onClick={() => {
                  if (!isLocked && !isReviewLocked) {
                    navigate(`/portal/${caseId}${step.route}`);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Step icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isComplete 
                        ? "bg-success/10 text-success" 
                        : "bg-primary/10 text-primary"
                    }`}>
                      {isComplete ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {step.description}
                      </p>
                      {step.id === "documentos" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {caseData.steps.documentos.uploaded} de {caseData.steps.documentos.recommended} recomendados
                        </p>
                      )}
                    </div>

                    {/* Status and arrow */}
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(stepStatus.status, step.required)}
                      {!isLocked && !isReviewLocked && (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Progress bar for in-progress steps */}
                  {stepStatus.status === "in_progress" && stepStatus.progress > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progresso</span>
                        <span className="text-xs text-muted-foreground">{stepStatus.progress}%</span>
                      </div>
                      <Progress value={stepStatus.progress} className="h-1.5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground text-sm">
                  Croqui é preliminar
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  O desenho no mapa serve para orientar a elaboração das peças técnicas. 
                  Não substitui o levantamento topográfico oficial.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default PortalHome;
