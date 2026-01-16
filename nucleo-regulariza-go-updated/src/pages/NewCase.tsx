import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Copy, 
  FileText, 
  MapPin, 
  User,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const municipalities = [
  "Abadiânia", "Alexânia", "Anápolis", "Aparecida de Goiânia", "Caldas Novas",
  "Catalão", "Cristalina", "Formosa", "Goiânia", "Itumbiara", "Jataí",
  "Luziânia", "Planaltina", "Rio Verde", "Valparaíso de Goiás"
];

const steps = [
  { id: 1, title: "Identificação", icon: FileText },
  { id: 2, title: "Cliente", icon: User },
  { id: 3, title: "Template", icon: MapPin },
  { id: 4, title: "Confirmar", icon: Check },
];

const NewCase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Identification
    caseName: "",
    municipality: "",
    observations: "",
    // Step 2: Client
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    // Step 3: Template
    enableConfrontantes: false,
    enableVistoria: false,
    enableSimulador: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.caseName.trim() && formData.municipality;
      case 2:
        return formData.clientName.trim() && formData.clientPhone.trim();
      case 3:
        return true; // Template is pre-selected
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newCaseId = `case_${Date.now()}`;
    setCreatedCaseId(newCaseId);
    setIsSubmitting(false);
    
    toast({
      title: "Caso criado com sucesso!",
      description: "O link do portal foi gerado. Envie ao cliente.",
    });
  };

  const getPortalLink = () => {
    return `${window.location.origin}/portal/${createdCaseId}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPortalLink());
    toast({
      title: "Link copiado!",
      description: "Envie o link ao cliente via WhatsApp ou e-mail.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/cases")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Novo Caso</h2>
            <p className="text-muted-foreground">Crie um novo caso de regularização</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${
                currentStep >= step.id ? "text-primary" : "text-muted-foreground"
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  currentStep > step.id 
                    ? "bg-success text-success-foreground" 
                    : currentStep === step.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 lg:w-24 h-0.5 mx-2 sm:mx-4 ${
                  currentStep > step.id ? "bg-success" : "bg-secondary"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form content */}
        <Card>
          <CardContent className="p-6">
            {/* Step 1: Identification */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <CardTitle className="mb-1">Identificação do Caso</CardTitle>
                  <CardDescription>
                    Informações básicas sobre o imóvel/posse
                  </CardDescription>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="caseName">Nome do caso *</Label>
                    <Input
                      id="caseName"
                      placeholder="Ex: Fazenda Santa Maria"
                      value={formData.caseName}
                      onChange={(e) => handleInputChange("caseName", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Escolha um nome fácil de identificar
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="municipality">Município (GO) *</Label>
                    <Select 
                      value={formData.municipality} 
                      onValueChange={(value) => handleInputChange("municipality", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o município" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((mun) => (
                          <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações (opcional)</Label>
                    <Textarea
                      id="observations"
                      placeholder="Anotações internas sobre o caso..."
                      value={formData.observations}
                      onChange={(e) => handleInputChange("observations", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Client */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <CardTitle className="mb-1">Dados do Cliente</CardTitle>
                  <CardDescription>
                    Informações de contato do requerente
                  </CardDescription>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nome completo *</Label>
                    <Input
                      id="clientName"
                      placeholder="Ex: José da Silva Santos"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange("clientName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">WhatsApp *</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="(62) 99999-9999"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">E-mail (opcional)</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="cliente@email.com"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Template */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <CardTitle className="mb-1">Template SEAPA</CardTitle>
                  <CardDescription>
                    Configuração do formulário e módulos extras
                  </CardDescription>
                </div>

                {/* Main template */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">Template Base SEAPA-GO</h4>
                        <Badge variant="admin">Obrigatório</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Formulário oficial com todas as seções: identificação, imóvel, histórico de posse, confrontações e declarações.
                      </p>
                    </div>
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Optional modules */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Módulos extras (opcional - Fase 2)</p>
                  
                  <div className="space-y-2">
                    {[
                      { id: "enableConfrontantes", label: "Gestão de Confrontantes", description: "CRM de anuências e sala de mediação" },
                      { id: "enableVistoria", label: "Pré-Vistoria Digital", description: "Checklist e fotos antes da vistoria" },
                      { id: "enableSimulador", label: "Simulador de Custos", description: "VTN e cálculo de descontos" },
                    ].map((module) => (
                      <div key={module.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-secondary/30 opacity-60">
                        <Checkbox 
                          id={module.id}
                          checked={formData[module.id as keyof typeof formData] as boolean}
                          onCheckedChange={(checked) => handleInputChange(module.id, checked as boolean)}
                          disabled
                        />
                        <div className="flex-1">
                          <Label htmlFor={module.id} className="font-medium">{module.label}</Label>
                          <p className="text-xs text-muted-foreground">{module.description}</p>
                        </div>
                        <Badge variant="secondary">Em breve</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {currentStep === 4 && !createdCaseId && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <CardTitle className="mb-1">Confirmar e Criar</CardTitle>
                  <CardDescription>
                    Revise os dados antes de criar o caso
                  </CardDescription>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <h4 className="font-medium text-foreground mb-3">Resumo do caso</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Nome:</dt>
                        <dd className="font-medium">{formData.caseName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Município:</dt>
                        <dd className="font-medium">{formData.municipality}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Cliente:</dt>
                        <dd className="font-medium">{formData.clientName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">WhatsApp:</dt>
                        <dd className="font-medium">{formData.clientPhone}</dd>
                      </div>
                      {formData.clientEmail && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">E-mail:</dt>
                          <dd className="font-medium">{formData.clientEmail}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Template:</dt>
                        <dd className="font-medium">SEAPA-GO Base</dd>
                      </div>
                    </dl>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Ao criar o caso, um link único será gerado para o cliente acessar o portal e preencher os dados.
                  </p>
                </div>
              </div>
            )}

            {/* Success state */}
            {createdCaseId && (
              <div className="space-y-6 animate-fade-in text-center py-8">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-success" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Caso criado com sucesso!
                  </h3>
                  <p className="text-muted-foreground">
                    Envie o link abaixo para o cliente via WhatsApp ou e-mail.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 flex items-center gap-3">
                  <Input 
                    value={getPortalLink()} 
                    readOnly 
                    className="bg-background"
                  />
                  <Button onClick={handleCopyLink} className="gap-2 flex-shrink-0">
                    <Copy className="w-4 h-4" />
                    Copiar
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => window.open(getPortalLink(), '_blank')} className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Testar portal
                  </Button>
                  <Button onClick={() => navigate("/dashboard/cases")} className="gap-2">
                    Ver todos os casos
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {!createdCaseId && (
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>

                {currentStep < 4 ? (
                  <Button onClick={handleNext} disabled={!isStepValid()}>
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        Criar caso e gerar link
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewCase;
