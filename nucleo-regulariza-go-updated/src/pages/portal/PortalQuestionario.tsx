import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Save,
  HelpCircle,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// SEAPA form sections
const sections = [
  { 
    id: "requerente", 
    title: "Identificação do Requerente",
    fields: 8,
    completed: 0,
    required: true 
  },
  { 
    id: "imovel", 
    title: "Identificação do Imóvel",
    fields: 10,
    completed: 0,
    required: true 
  },
  { 
    id: "historico", 
    title: "Histórico da Posse",
    fields: 6,
    completed: 0,
    required: true 
  },
  { 
    id: "confrontacoes", 
    title: "Confrontações",
    fields: 4,
    completed: 0,
    required: true 
  },
  { 
    id: "declaracoes", 
    title: "Declarações e Consentimentos",
    fields: 5,
    completed: 0,
    required: true 
  },
];

const PortalQuestionario = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [openSection, setOpenSection] = useState("requerente");
  
  // Form state - simplified for demo
  const [formData, setFormData] = useState({
    // Requerente
    nomeCompleto: "",
    cpf: "",
    rg: "",
    orgaoExpedidor: "",
    dataNascimento: "",
    estadoCivil: "",
    profissao: "",
    endereco: "",
    telefone: "",
    email: "",
    
    // Imóvel
    denominacao: "",
    municipio: "",
    localidade: "",
    areaAproximada: "",
    matricula: "",
    car: "",
    ccir: "",
    
    // Histórico
    formaAquisicao: "",
    dataAquisicao: "",
    tempoPosseAnos: "",
    origemPosse: "",
    benfeitorias: "",
    
    // Confrontações
    confrontanteNorte: "",
    confrontanteSul: "",
    confrontanteLeste: "",
    confrontanteOeste: "",
    
    // Declarações
    declaracaoVeracidade: false,
    declaracaoPosse: false,
    declaracaoBenfeitorias: false,
    autorizacaoContato: false,
    lgpdConsent: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast({
      title: "Rascunho salvo!",
      description: "Suas respostas foram salvas. Continue quando quiser.",
    });
  };

  // Calculate progress
  const filledFields = Object.values(formData).filter(v => v !== "" && v !== false).length;
  const totalFields = Object.keys(formData).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  return (
    <PortalLayout title="Questionário SEAPA" showBack caseName="Fazenda Santa Maria">
      <div className="space-y-4 pb-28">
        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progresso do questionário</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {filledFields} de {totalFields} campos preenchidos
            </p>
          </CardContent>
        </Card>

        {/* Form sections */}
        <Accordion 
          type="single" 
          collapsible 
          value={openSection}
          onValueChange={setOpenSection}
          className="space-y-3"
        >
          {/* Section 1: Requerente */}
          <AccordionItem value="requerente" className="border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-foreground">Identificação do Requerente</h4>
                  <p className="text-xs text-muted-foreground">Dados pessoais do ocupante/proprietário</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeCompleto">
                      Nome completo *
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3.5 h-3.5 inline ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Nome conforme documento de identidade</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="nomeCompleto"
                      placeholder="Nome conforme documento"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rg">RG *</Label>
                      <Input
                        id="rg"
                        placeholder="0000000"
                        value={formData.rg}
                        onChange={(e) => handleInputChange("rg", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="orgaoExpedidor">Órgão expedidor</Label>
                      <Input
                        id="orgaoExpedidor"
                        placeholder="SSP/GO"
                        value={formData.orgaoExpedidor}
                        onChange={(e) => handleInputChange("orgaoExpedidor", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data nasc. *</Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={formData.dataNascimento}
                        onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="estadoCivil">Estado civil</Label>
                      <Select 
                        value={formData.estadoCivil}
                        onValueChange={(value) => handleInputChange("estadoCivil", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                          <SelectItem value="uniao_estavel">União estável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profissao">Profissão</Label>
                      <Input
                        id="profissao"
                        placeholder="Agricultor"
                        value={formData.profissao}
                        onChange={(e) => handleInputChange("profissao", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço completo *</Label>
                    <Textarea
                      id="endereco"
                      placeholder="Rua, número, bairro, cidade, CEP"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        placeholder="(62) 99999-9999"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange("telefone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 2: Imóvel */}
          <AccordionItem value="imovel" className="border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-foreground">Identificação do Imóvel</h4>
                  <p className="text-xs text-muted-foreground">Dados da propriedade/posse</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="denominacao">Denominação do imóvel *</Label>
                  <Input
                    id="denominacao"
                    placeholder="Ex: Fazenda Santa Maria"
                    value={formData.denominacao}
                    onChange={(e) => handleInputChange("denominacao", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="municipio">Município *</Label>
                    <Input
                      id="municipio"
                      value="Cristalina"
                      disabled
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="localidade">Localidade/Distrito</Label>
                    <Input
                      id="localidade"
                      placeholder="Nome da região"
                      value={formData.localidade}
                      onChange={(e) => handleInputChange("localidade", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaAproximada">Área aproximada (ha) *</Label>
                  <Input
                    id="areaAproximada"
                    type="number"
                    placeholder="Ex: 50.5"
                    value={formData.areaAproximada}
                    onChange={(e) => handleInputChange("areaAproximada", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matricula">
                    Matrícula (se houver)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 inline ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Número da matrícula no cartório de registro de imóveis</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="matricula"
                    placeholder="Nº da matrícula"
                    value={formData.matricula}
                    onChange={(e) => handleInputChange("matricula", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="car">CAR (se houver)</Label>
                    <Input
                      id="car"
                      placeholder="Código CAR"
                      value={formData.car}
                      onChange={(e) => handleInputChange("car", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ccir">CCIR (se houver)</Label>
                    <Input
                      id="ccir"
                      placeholder="Código CCIR"
                      value={formData.ccir}
                      onChange={(e) => handleInputChange("ccir", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 3: Histórico */}
          <AccordionItem value="historico" className="border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-foreground">Histórico da Posse</h4>
                  <p className="text-xs text-muted-foreground">Origem e tempo de ocupação</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="formaAquisicao">Forma de aquisição *</Label>
                  <Select 
                    value={formData.formaAquisicao}
                    onValueChange={(value) => handleInputChange("formaAquisicao", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compra">Compra e venda</SelectItem>
                      <SelectItem value="heranca">Herança</SelectItem>
                      <SelectItem value="doacao">Doação</SelectItem>
                      <SelectItem value="posse">Posse direta</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dataAquisicao">Data de aquisição</Label>
                    <Input
                      id="dataAquisicao"
                      type="date"
                      value={formData.dataAquisicao}
                      onChange={(e) => handleInputChange("dataAquisicao", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempoPosseAnos">Tempo de posse (anos) *</Label>
                    <Input
                      id="tempoPosseAnos"
                      type="number"
                      placeholder="Ex: 15"
                      value={formData.tempoPosseAnos}
                      onChange={(e) => handleInputChange("tempoPosseAnos", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origemPosse">Origem/histórico da posse</Label>
                  <Textarea
                    id="origemPosse"
                    placeholder="Descreva como adquiriu a posse, de quem comprou/herdou, etc."
                    value={formData.origemPosse}
                    onChange={(e) => handleInputChange("origemPosse", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benfeitorias">Benfeitorias existentes</Label>
                  <Textarea
                    id="benfeitorias"
                    placeholder="Casa, curral, cercas, poços, plantações, etc."
                    value={formData.benfeitorias}
                    onChange={(e) => handleInputChange("benfeitorias", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 4: Confrontações */}
          <AccordionItem value="confrontacoes" className="border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">4</span>
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-foreground">Confrontações</h4>
                  <p className="text-xs text-muted-foreground">Vizinhos e limites</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  Informe os nomes dos confrontantes (vizinhos) em cada direção.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="confrontanteNorte">Norte *</Label>
                  <Input
                    id="confrontanteNorte"
                    placeholder="Nome do confrontante ou descrição"
                    value={formData.confrontanteNorte}
                    onChange={(e) => handleInputChange("confrontanteNorte", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confrontanteSul">Sul *</Label>
                  <Input
                    id="confrontanteSul"
                    placeholder="Nome do confrontante ou descrição"
                    value={formData.confrontanteSul}
                    onChange={(e) => handleInputChange("confrontanteSul", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confrontanteLeste">Leste *</Label>
                  <Input
                    id="confrontanteLeste"
                    placeholder="Nome do confrontante ou descrição"
                    value={formData.confrontanteLeste}
                    onChange={(e) => handleInputChange("confrontanteLeste", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confrontanteOeste">Oeste *</Label>
                  <Input
                    id="confrontanteOeste"
                    placeholder="Nome do confrontante ou descrição"
                    value={formData.confrontanteOeste}
                    onChange={(e) => handleInputChange("confrontanteOeste", e.target.value)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 5: Declarações */}
          <AccordionItem value="declaracoes" className="border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">5</span>
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-foreground">Declarações</h4>
                  <p className="text-xs text-muted-foreground">Consentimentos obrigatórios</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                    <Checkbox 
                      id="declaracaoVeracidade"
                      checked={formData.declaracaoVeracidade}
                      onCheckedChange={(checked) => handleInputChange("declaracaoVeracidade", checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="declaracaoVeracidade" className="font-medium">
                        Declaração de veracidade *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Declaro que as informações prestadas são verdadeiras e assumo responsabilidade civil e criminal por sua veracidade.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                    <Checkbox 
                      id="declaracaoPosse"
                      checked={formData.declaracaoPosse}
                      onCheckedChange={(checked) => handleInputChange("declaracaoPosse", checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="declaracaoPosse" className="font-medium">
                        Declaração de posse mansa e pacífica *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Declaro exercer posse mansa, pacífica e ininterrupta sobre o imóvel.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                    <Checkbox 
                      id="declaracaoBenfeitorias"
                      checked={formData.declaracaoBenfeitorias}
                      onCheckedChange={(checked) => handleInputChange("declaracaoBenfeitorias", checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="declaracaoBenfeitorias" className="font-medium">
                        Declaração de benfeitorias *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Declaro que as benfeitorias informadas foram realizadas por mim ou meus antecessores.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                    <Checkbox 
                      id="autorizacaoContato"
                      checked={formData.autorizacaoContato}
                      onCheckedChange={(checked) => handleInputChange("autorizacaoContato", checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="autorizacaoContato" className="font-medium">
                        Autorização de contato *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Autorizo o contato com confrontantes para fins de anuência e regularização.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                    <Checkbox 
                      id="lgpdConsent"
                      checked={formData.lgpdConsent}
                      onCheckedChange={(checked) => handleInputChange("lgpdConsent", checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="lgpdConsent" className="font-medium">
                        Consentimento LGPD *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Autorizo o tratamento dos meus dados pessoais para fins de regularização fundiária, conforme a Lei 13.709/2018.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Fixed save buttons */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="container max-w-lg mx-auto flex gap-3">
            <Button 
              variant="outline"
              className="flex-1 gap-2" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar rascunho
            </Button>
            <Button 
              className="flex-1 gap-2" 
              onClick={() => navigate(`/portal/${caseId}`)}
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalQuestionario;
