import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Upload,
  FileText,
  Image,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  Plus,
  File
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/hooks/useNotifications";

// Document categories
const categories = [
  {
    id: "identificacao",
    title: "Identificação",
    description: "RG, CPF, comprovante de residência",
    recommended: ["RG ou CNH", "CPF", "Comprovante de residência"],
    icon: FileText,
  },
  {
    id: "posse",
    title: "Comprovação de Posse",
    description: "Contratos, recibos, declarações",
    recommended: ["Contrato de compra/cessão", "Recibos de pagamento", "Declaração de vizinhos"],
    icon: FileText,
  },
  {
    id: "imovel",
    title: "Documentos do Imóvel",
    description: "Matrícula, CAR, ITR",
    recommended: ["Certidão de matrícula", "CAR", "CCIR/ITR"],
    icon: FileText,
  },
  {
    id: "mapas",
    title: "Mapas e Arquivos",
    description: "Croquis, plantas, KML",
    recommended: ["Croqui ou planta existente", "Arquivo KML/KMZ"],
    icon: Image,
  },
];

// Mock uploaded documents
const mockDocuments = [
  { id: "1", name: "RG_frente.jpg", category: "identificacao", size: "1.2 MB", uploadedAt: "2024-01-15" },
  { id: "2", name: "CPF.pdf", category: "identificacao", size: "245 KB", uploadedAt: "2024-01-15" },
];

const PortalDocumentos = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Calculate progress
  const totalRecommended = categories.reduce((acc, cat) => acc + cat.recommended.length, 0);
  const uploadedCount = documents.length;
  const progress = Math.min(Math.round((uploadedCount / 5) * 100), 100); // 5 is minimum recommended

  const handleFileSelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newDocs = Array.from(files).map((file, index) => ({
      id: `new_${Date.now()}_${index}`,
      name: file.name,
      category: selectedCategory || "identificacao",
      size: `${(file.size / 1024).toFixed(0)} KB`,
      uploadedAt: new Date().toISOString().split("T")[0],
    }));

    setDocuments(prev => [...prev, ...newDocs]);
    setIsUploading(false);
    setSelectedCategory(null);

    // Create notification for topographer
    await createNotification({
      case_id: caseId || '1',
      case_name: 'Fazenda Santa Maria',
      type: 'document_uploaded',
      title: `${files.length} documento(s) enviado(s)`,
      message: `O cliente enviou: ${Array.from(files).map(f => f.name).join(', ')}`,
      metadata: { 
        files: Array.from(files).map(f => f.name),
        category: selectedCategory 
      }
    });

    toast({
      title: "Documento(s) enviado(s)!",
      description: `${files.length} arquivo(s) anexado(s) com sucesso.`,
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast({
      title: "Documento removido",
      description: "O arquivo foi excluído.",
    });
  };

  const getDocumentsByCategory = (categoryId: string) => {
    return documents.filter(d => d.category === categoryId);
  };

  return (
    <PortalLayout title="Documentos" showBack caseName="Fazenda Santa Maria">
      <div className="space-y-4 pb-28">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.kml,.kmz"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Documentos anexados</span>
              <span className="text-sm text-muted-foreground">{uploadedCount} de 5+ recomendados</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Info banner */}
        <Card className="bg-info/5 border-info/30">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">
                Anexe documentos legíveis e atualizados. Formatos aceitos: PDF, JPG, PNG, DOC, KML.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryDocs = getDocumentsByCategory(category.id);
            const hasDocuments = categoryDocs.length > 0;

            return (
              <Card key={category.id}>
                <CardContent className="p-4">
                  {/* Category header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <category.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{category.title}</h4>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    {hasDocuments && (
                      <Badge variant="complete" className="gap-1">
                        <Check className="w-3 h-3" />
                        {categoryDocs.length}
                      </Badge>
                    )}
                  </div>

                  {/* Recommended documents */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Recomendados:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.recommended.map((rec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs font-normal">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Uploaded documents */}
                  {categoryDocs.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {categoryDocs.map((doc) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.size}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleRemoveDocument(doc.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleFileSelect(category.id)}
                    disabled={isUploading}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar documento
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Fixed continue button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="container max-w-lg mx-auto">
            <Button 
              className="w-full gap-2" 
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

export default PortalDocumentos;
