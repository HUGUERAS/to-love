import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  FileText,
  User,
  Send,
  Plus,
  Eye,
  Download,
  ExternalLink,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for the case
const mockCase = {
  id: "1",
  name: "Fazenda Santa Maria",
  municipality: "Cristalina",
  client: {
    name: "José Santos",
    phone: "(62) 99999-1111",
    email: "jose.santos@email.com",
    cpf: "123.456.789-00"
  },
  submittedAt: "2024-01-15T10:30:00",
  status: "review"
};

const mockCroqui = {
  version: 3,
  area: "125.5",
  vertices: 8,
  perimeter: "4.8",
  submittedAt: "2024-01-14T16:00:00",
  referencePoints: [
    { name: "Porteira principal", coordinates: "-16.0745, -47.6589" },
    { name: "Marco do INCRA", coordinates: "-16.0752, -47.6601" }
  ],
  observations: "Área inclui nascente no canto sudeste. Limites definidos por cerca de arame."
};

const mockQuestionario = {
  progress: 92,
  sections: [
    { name: "Identificação do Requerente", status: "complete", fields: 8, filled: 8 },
    { name: "Identificação do Imóvel", status: "complete", fields: 12, filled: 12 },
    { name: "Histórico da Posse", status: "incomplete", fields: 6, filled: 5 },
    { name: "Confrontações", status: "complete", fields: 4, filled: 4 },
    { name: "Declarações e Consentimentos", status: "complete", fields: 3, filled: 3 }
  ],
  data: {
    nomeCompleto: "José da Silva Santos",
    cpf: "123.456.789-00",
    rg: "4.567.890 SSP/GO",
    estadoCivil: "Casado",
    profissao: "Agricultor",
    endereco: "Rua das Flores, 123",
    cidade: "Cristalina",
    telefone: "(62) 99999-1111",
    email: "jose.santos@email.com",
    nomeImovel: "Fazenda Santa Maria",
    municipioImovel: "Cristalina",
    areaTotal: "125.5 ha",
    limiteNorte: "Fazenda Boa Esperança - João Pereira",
    limiteSul: "Córrego da Mata",
    limiteLeste: "Estrada vicinal GO-118",
    limiteOeste: "Sítio São José - Maria Oliveira",
    dataOcupacao: "Março de 1998",
    formaAquisicao: "Compra verbal do antigo ocupante",
    tempoPosse: "26 anos"
  }
};

const mockDocumentos = [
  { id: "1", name: "RG.pdf", category: "Identificação", status: "approved", size: "1.2 MB" },
  { id: "2", name: "CPF.pdf", category: "Identificação", status: "approved", size: "0.8 MB" },
  { id: "3", name: "Comprovante_Residencia.pdf", category: "Identificação", status: "pending", size: "2.1 MB" },
  { id: "4", name: "Declaracao_Posse_Vizinhos.pdf", category: "Comprovação de Posse", status: "approved", size: "1.5 MB" },
  { id: "5", name: "Recibos_IPTU.pdf", category: "Comprovação de Posse", status: "rejected", size: "3.2 MB", rejectReason: "Documentos ilegíveis" },
  { id: "6", name: "Mapa_Propriedade.kml", category: "Mapas e Arquivos", status: "approved", size: "0.5 MB" }
];

const mockPendencias = [
  { 
    id: "1", 
    type: "document",
    title: "Documento de identidade do cônjuge",
    description: "Necessário anexar RG ou CNH do cônjuge para comprovar estado civil.",
    status: "open",
    createdAt: "2024-01-15T08:00:00",
    priority: "high"
  },
  { 
    id: "2", 
    type: "form",
    title: "Campo 'Data de início da posse' incompleto",
    description: "Informar data aproximada de início da ocupação do imóvel.",
    status: "open",
    createdAt: "2024-01-14T14:00:00",
    priority: "medium"
  },
  { 
    id: "3", 
    type: "croqui",
    title: "Ajustar vértice nordeste",
    description: "O vértice NE está sobre a estrada, ajustar para dentro do limite real.",
    status: "resolved",
    createdAt: "2024-01-13T10:00:00",
    resolvedAt: "2024-01-14T16:00:00",
    priority: "low"
  }
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "approved":
      return { label: "Aprovado", color: "bg-success text-success-foreground", icon: CheckCircle };
    case "rejected":
      return { label: "Rejeitado", color: "bg-destructive text-destructive-foreground", icon: X };
    case "pending":
      return { label: "Pendente", color: "bg-warning text-warning-foreground", icon: Clock };
    default:
      return { label: "Em análise", color: "bg-muted text-muted-foreground", icon: Clock };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case "high":
      return { label: "Alta", color: "destructive" as const };
    case "medium":
      return { label: "Média", color: "pending" as const };
    default:
      return { label: "Baixa", color: "secondary" as const };
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const CaseReview = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pendencias, setPendencias] = useState(mockPendencias);
  const [documentos, setDocumentos] = useState(mockDocumentos);
  const [newPendenciaOpen, setNewPendenciaOpen] = useState(false);
  const [requestComplementOpen, setRequestComplementOpen] = useState(false);
  const [newPendencia, setNewPendencia] = useState({
    type: "document",
    title: "",
    description: "",
    priority: "medium"
  });

  const openPendencias = pendencias.filter(p => p.status === "open").length;
  const resolvedPendencias = pendencias.filter(p => p.status === "resolved").length;

  const handleCreatePendencia = () => {
    if (!newPendencia.title.trim()) {
      toast({
        title: "Erro",
        description: "Informe o título da pendência.",
        variant: "destructive"
      });
      return;
    }

    const pendencia = {
      id: Date.now().toString(),
      ...newPendencia,
      status: "open",
      createdAt: new Date().toISOString()
    };
    
    setPendencias([pendencia, ...pendencias]);
    setNewPendenciaOpen(false);
    setNewPendencia({ type: "document", title: "", description: "", priority: "medium" });
    
    toast({
      title: "Pendência criada",
      description: "A pendência foi adicionada à lista."
    });
  };

  const handleResolvePendencia = (id: string) => {
    setPendencias(pendencias.map(p => 
      p.id === id ? { ...p, status: "resolved", resolvedAt: new Date().toISOString() } : p
    ));
    toast({
      title: "Pendência resolvida",
      description: "A pendência foi marcada como resolvida."
    });
  };

  const handleReopenPendencia = (id: string) => {
    setPendencias(pendencias.map(p => 
      p.id === id ? { ...p, status: "open", resolvedAt: undefined } : p
    ));
  };

  const handleDeletePendencia = (id: string) => {
    setPendencias(pendencias.filter(p => p.id !== id));
    toast({
      title: "Pendência removida",
      description: "A pendência foi excluída."
    });
  };

  const handleDocumentStatus = (id: string, status: string, reason?: string) => {
    setDocumentos(documentos.map(d => 
      d.id === id ? { ...d, status, rejectReason: reason } : d
    ));
    toast({
      title: status === "approved" ? "Documento aprovado" : "Documento rejeitado",
      description: status === "approved" 
        ? "O documento foi aprovado."
        : "O documento foi rejeitado e uma pendência será criada."
    });
  };

  const handleSendComplement = () => {
    toast({
      title: "Solicitação enviada!",
      description: "O cliente foi notificado sobre as pendências via WhatsApp e email."
    });
    setRequestComplementOpen(false);
  };

  const handleApproveCase = () => {
    if (openPendencias > 0) {
      toast({
        title: "Existem pendências abertas",
        description: "Resolva todas as pendências antes de aprovar o caso.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Caso aprovado!",
      description: "O dossiê foi aprovado e está pronto para exportação."
    });
    navigate("/dashboard/cases");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/dashboard/cases")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">{mockCase.name}</h2>
                <Badge variant="active">Em revisão</Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {mockCase.municipality} • Enviado em {formatDate(mockCase.submittedAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-12 sm:ml-0">
            <Button 
              variant="outline"
              onClick={() => window.open(`/portal/${caseId}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver portal
            </Button>
            <Dialog open={requestComplementOpen} onOpenChange={setRequestComplementOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Solicitar complementação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar complementação</DialogTitle>
                  <DialogDescription>
                    Enviar notificação ao cliente sobre as pendências abertas.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="font-medium mb-2">Pendências a enviar:</p>
                    <ul className="space-y-2">
                      {pendencias.filter(p => p.status === "open").map(p => (
                        <li key={p.id} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                          <span>{p.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagem adicional (opcional)</Label>
                    <Textarea 
                      placeholder="Adicione uma mensagem personalizada para o cliente..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="whatsapp" defaultChecked />
                    <label htmlFor="whatsapp" className="text-sm">Enviar via WhatsApp</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="email" defaultChecked />
                    <label htmlFor="email" className="text-sm">Enviar via Email</label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRequestComplementOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSendComplement}>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar solicitação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={handleApproveCase} disabled={openPendencias > 0}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovar dossiê
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{openPendencias}</p>
                  <p className="text-xs text-muted-foreground">Pendências abertas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{resolvedPendencias}</p>
                  <p className="text-xs text-muted-foreground">Resolvidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documentos.length}</p>
                  <p className="text-xs text-muted-foreground">Documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockCroqui.area} ha</p>
                  <p className="text-xs text-muted-foreground">Área do imóvel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content tabs */}
        <Tabs defaultValue="pendencias" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pendencias" className="gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Pendências</span>
              {openPendencias > 0 && (
                <Badge variant="destructive" className="ml-1">{openPendencias}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="croqui" className="gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Croqui</span>
            </TabsTrigger>
            <TabsTrigger value="questionario" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Questionário</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documentos</span>
            </TabsTrigger>
          </TabsList>

          {/* Pendências Tab */}
          <TabsContent value="pendencias" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gestão de Pendências</h3>
              <Dialog open={newPendenciaOpen} onOpenChange={setNewPendenciaOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova pendência
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar nova pendência</DialogTitle>
                    <DialogDescription>
                      Adicione uma pendência que o cliente deve resolver.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select 
                        value={newPendencia.type} 
                        onValueChange={(v) => setNewPendencia({...newPendencia, type: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">Documento</SelectItem>
                          <SelectItem value="form">Formulário</SelectItem>
                          <SelectItem value="croqui">Croqui</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input 
                        placeholder="Ex: Documento de identidade do cônjuge"
                        value={newPendencia.title}
                        onChange={(e) => setNewPendencia({...newPendencia, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea 
                        placeholder="Descreva o que precisa ser feito..."
                        value={newPendencia.description}
                        onChange={(e) => setNewPendencia({...newPendencia, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select 
                        value={newPendencia.priority} 
                        onValueChange={(v) => setNewPendencia({...newPendencia, priority: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="low">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewPendenciaOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePendencia}>
                      Criar pendência
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {pendencias.map((pendencia) => {
                const priority = getPriorityConfig(pendencia.priority);
                const isResolved = pendencia.status === "resolved";
                
                return (
                  <Card key={pendencia.id} className={isResolved ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isResolved ? "bg-success/10" : "bg-warning/10"
                          }`}>
                            {isResolved ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-warning" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium ${isResolved ? "line-through text-muted-foreground" : ""}`}>
                                {pendencia.title}
                              </p>
                              <Badge variant={priority.color} className="text-xs">
                                {priority.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {pendencia.type === "document" ? "Documento" : 
                                 pendencia.type === "form" ? "Formulário" : "Croqui"}
                              </Badge>
                            </div>
                            {pendencia.description && (
                              <p className="text-sm text-muted-foreground">
                                {pendencia.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Criada em {formatDate(pendencia.createdAt)}
                              {isResolved && pendencia.resolvedAt && (
                                <span> • Resolvida em {formatDate(pendencia.resolvedAt)}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isResolved ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleReopenPendencia(pendencia.id)}
                            >
                              Reabrir
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleResolvePendencia(pendencia.id)}
                            >
                              <Check className="w-4 h-4 text-success" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeletePendencia(pendencia.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {pendencias.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-12 h-12 text-success mb-4" />
                    <p className="text-lg font-medium">Nenhuma pendência!</p>
                    <p className="text-muted-foreground text-sm">
                      Todas as pendências foram resolvidas.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Croqui Tab */}
          <TabsContent value="croqui" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Croqui da Propriedade</CardTitle>
                    <CardDescription>
                      Versão {mockCroqui.version} • Enviado em {formatDate(mockCroqui.submittedAt)}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => window.open(`/portal/${caseId}/croqui`, '_blank')}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver no mapa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Map preview placeholder */}
                <div className="w-full h-64 bg-secondary rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>Prévia do mapa</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Área</p>
                    <p className="text-xl font-bold">{mockCroqui.area} ha</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Perímetro</p>
                    <p className="text-xl font-bold">{mockCroqui.perimeter} km</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Vértices</p>
                    <p className="text-xl font-bold">{mockCroqui.vertices}</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Versão</p>
                    <p className="text-xl font-bold">{mockCroqui.version}</p>
                  </div>
                </div>

                {/* Reference points */}
                <div>
                  <h4 className="font-medium mb-3">Pontos de Referência</h4>
                  <div className="space-y-2">
                    {mockCroqui.referencePoints.map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">{point.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground font-mono">
                          {point.coordinates}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observations */}
                {mockCroqui.observations && (
                  <div>
                    <h4 className="font-medium mb-2">Observações do Cliente</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-secondary/30 rounded-lg">
                      {mockCroqui.observations}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questionário Tab */}
          <TabsContent value="questionario" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Questionário SEAPA</CardTitle>
                    <CardDescription>
                      Preenchimento {mockQuestionario.progress}% completo
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => window.open(`/portal/${caseId}/questionario`, '_blank')}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver formulário
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress by section */}
                <div className="space-y-3">
                  {mockQuestionario.sections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {section.status === "complete" ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-warning" />
                        )}
                        <span className="font-medium">{section.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {section.filled}/{section.fields} campos
                        </span>
                        <Badge variant={section.status === "complete" ? "complete" : "pending"}>
                          {section.status === "complete" ? "Completo" : "Incompleto"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Data preview */}
                <div>
                  <h4 className="font-medium mb-3">Dados Preenchidos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(mockQuestionario.data).map(([key, value]) => (
                      <div key={key} className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentos Tab */}
          <TabsContent value="documentos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Enviados</CardTitle>
                <CardDescription>
                  {documentos.filter(d => d.status === "approved").length} de {documentos.length} documentos aprovados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentos.map((doc) => {
                      const status = getStatusConfig(doc.status);
                      const StatusIcon = status.icon;
                      
                      return (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              {doc.name}
                            </div>
                          </TableCell>
                          <TableCell>{doc.category}</TableCell>
                          <TableCell>{doc.size}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                              {doc.rejectReason && (
                                <span className="text-xs text-destructive">
                                  {doc.rejectReason}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="w-4 h-4" />
                              </Button>
                              {doc.status === "pending" && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDocumentStatus(doc.id, "approved")}
                                  >
                                    <Check className="w-4 h-4 text-success" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDocumentStatus(doc.id, "rejected", "Documento ilegível")}
                                  >
                                    <X className="w-4 h-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Client info sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{mockCase.client.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{mockCase.client.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{mockCase.client.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{mockCase.client.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CaseReview;
