import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CroquiMap } from "@/components/map/CroquiMap";
import { 
  Save,
  History,
  AlertTriangle,
  Loader2,
  Key,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/hooks/useNotifications";

// Mock croqui versions
const mockVersions = [
  { id: "v2", version: 2, createdAt: "2024-01-15T14:30:00", author: "Cliente" },
  { id: "v1", version: 1, createdAt: "2024-01-14T10:00:00", author: "Cliente" },
];

// Default to Goiás center
const GOIAS_CENTER: [number, number] = [-49.2648, -16.6869];

const MAPBOX_STORAGE_KEY = "mapbox_token";
const FALLBACK_MAPBOX_TOKEN = "pk.eyJ1IjoiaHVndWVyYXMiLCJhIjoiY21rM2VoYmgwMHBjMDNkbjZvd3UwaTBoMSJ9.8CcZU7jA0Caeq5mOjRp-6A";

const getInitialMapboxToken = () => {
  const envToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

  if (typeof window !== "undefined") {
    const storedToken = window.localStorage.getItem(MAPBOX_STORAGE_KEY);
    if (storedToken) {
      return storedToken;
    }
  }

  return envToken || FALLBACK_MAPBOX_TOKEN;
};

const PortalCroqui = () => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  
  // Mapbox token state - prefer stored token, then env, then bundled fallback
  const [mapboxToken, setMapboxToken] = useState<string>(() => getInitialMapboxToken());
  const [showTokenInput, setShowTokenInput] = useState(() => !getInitialMapboxToken());
  const [tokenInput, setTokenInput] = useState('');
  
  // Polygon data
  const [polygonArea, setPolygonArea] = useState<number>(0);
  const [vertexCount, setVertexCount] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    referencias: "",
    observacoes: "",
  });

  // Handle polygon changes from map
  const handlePolygonChange = useCallback((polygon: GeoJSON.Feature<GeoJSON.Polygon> | null, area: number) => {
    setPolygonArea(area);
    if (polygon?.geometry?.coordinates?.[0]) {
      setVertexCount(polygon.geometry.coordinates[0].length - 1); // -1 because last point = first point
    } else {
      setVertexCount(0);
    }
    setHasChanges(true);
  }, []);

  /**
   * Salva a versão atual do croqui do caso ativo.
   *
   * - Verifica se existe um identificador de caso (`caseId`). Se ausente, exibe um toast de erro e aborta a operação.
   * - Marca o estado como salvando (`setIsSaving(true)`), cria uma notificação via `createNotification` informando a atualização do croqui
   *   (inclui `case_id`, `case_name` fixo como "Fazenda Santa Maria", `type: 'croqui_updated'`, `title`, `message` com `polygonArea`
   *   e `vertexCount`, e `metadata` com `area`, `vertices` e `version` calculada como `mockVersions.length + 1`).
   * - Aguarda brevemente (500 ms), limpa o estado de salvamento e alterações (`setIsSaving(false)`, `setHasChanges(false)`) e exibe um toast
   *   de sucesso indicando a nova versão criada.
   *
   * Observação: erros lançados por `createNotification` (ou por outras operações assíncronas aguardadas) não são capturados internamente
   * e farão com que a promise retornada seja rejeitada. Em caso de rejeição, o estado `isSaving` pode permanecer `true` até que o chamador trate o erro.
   *
   * @async
   * @returns {Promise<void>} Promise resolvida quando a operação de salvar e as atualizações de UI forem concluídas.
   * @throws Pode propagar erros provenientes de `createNotification` ou de outras operações assíncronas internas.
   */
  const handleSave = async () => {
    // Ensure we have a valid case identifier before proceeding
    if (!caseId) {
      toast({
        title: "Erro ao salvar croqui",
        description: "Identificador do caso não encontrado. Tente acessar o croqui novamente a partir da lista de casos.",
      });
      return;
    }

    setIsSaving(true);
    
    // Create notification for topographer
    const notificationTitle = `Nova versão do croqui salva. Área: ${polygonArea.toFixed(2)} ha, ${vertexCount} vértices.`;
    await createNotification({
      case_id: caseId,
      case_name: 'Fazenda Santa Maria',
      type: 'croqui_updated',
      title: 'Croqui atualizado',
      message: notificationTitle,
      metadata: { 
        area: polygonArea,
        vertices: vertexCount,
        version: mockVersions.length + 1
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    setHasChanges(false);
    toast({
      title: "Croqui salvo!",
      description: `Versão ${mockVersions.length + 1} criada com sucesso.`,
    });
  };

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem(MAPBOX_STORAGE_KEY, tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setShowTokenInput(false);
      toast({
        title: "Token salvo!",
        description: "O mapa será carregado agora.",
      });
    }
  };

  // Token input screen
  if (showTokenInput) {
    return (
      <PortalLayout title="Croqui no Mapa" showBack caseName="Fazenda Santa Maria">
        <div className="space-y-4 pb-24">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Key className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Configurar Mapbox
                </h3>
                <p className="text-sm text-muted-foreground">
                  Para usar o mapa com satélite, você precisa de um token Mapbox. 
                  É gratuito para até 50.000 visualizações/mês.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mapboxToken">Token público do Mapbox</Label>
                <Input
                  id="mapboxToken"
                  placeholder="pk.eyJ1Ijo..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Acesse{" "}
                  <a 
                    href="https://account.mapbox.com/access-tokens/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com
                  </a>
                  {" "}para obter seu token gratuito.
                </p>
              </div>

              <Button 
                className="w-full" 
                onClick={handleSaveToken}
                disabled={!tokenInput.trim()}
              >
                Salvar e continuar
              </Button>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Croqui no Mapa" showBack caseName="Fazenda Santa Maria">
      <div className="space-y-4 pb-24">
        {/* Warning banner */}
        <Card className="bg-warning/5 border-warning/30">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">
                <strong>Croqui preliminar</strong> para orientar as peças técnicas. 
                Não substitui levantamento topográfico.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Map container */}
        <Card className="overflow-hidden">
          <div className="aspect-square sm:aspect-video">
            <CroquiMap 
              mapboxToken={mapboxToken}
              center={GOIAS_CENTER}
              zoom={8}
              onPolygonChange={handlePolygonChange}
            />
          </div>
        </Card>

        {/* Version button */}
        <div className="flex justify-between items-center">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setShowVersions(!showVersions)}
          >
            <History className="w-4 h-4" />
            Versão {mockVersions.length + 1}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              localStorage.removeItem(MAPBOX_STORAGE_KEY);
              setMapboxToken('');
              setShowTokenInput(true);
            }}
          >
            Trocar token
          </Button>
        </div>

        {/* Versions panel */}
        {showVersions && (
          <Card className="animate-fade-in">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground mb-3">Histórico de versões</h4>
              <div className="space-y-2">
                {mockVersions.map((version) => (
                  <div 
                    key={version.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="text-sm font-medium">Versão {version.version}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })} • {version.author}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">Restaurar</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Croqui summary */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Resumo do croqui
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-secondary/50">
                <dt className="text-muted-foreground">Área aproximada:</dt>
                <dd className="font-medium">
                  {polygonArea > 0 ? `${polygonArea.toFixed(2)} ha` : "— ha"}
                </dd>
              </div>
              <div className="flex justify-between p-2 rounded bg-secondary/50">
                <dt className="text-muted-foreground">Vértices:</dt>
                <dd className="font-medium">{vertexCount > 0 ? vertexCount : "—"}</dd>
              </div>
              <div className="flex justify-between p-2 rounded bg-secondary/50">
                <dt className="text-muted-foreground">Perímetro:</dt>
                <dd className="font-medium">— m</dd>
              </div>
            </dl>
            {polygonArea === 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Desenhe o polígono ou importe um KML para calcular
              </p>
            )}
          </CardContent>
        </Card>

        {/* Reference points */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referencias">Pontos de referência</Label>
              <Textarea
                id="referencias"
                placeholder="Ex: Divisa com Fazenda Boa Vista ao Norte, estrada vicinal ao Sul..."
                value={formData.referencias}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, referencias: e.target.value }));
                  setHasChanges(true);
                }}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Descreva marcos, estradas, rios ou propriedades vizinhas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações sobre os limites</Label>
              <Textarea
                id="observacoes"
                placeholder="Ex: Cerca de arame na divisa leste, sem cerca definida ao oeste..."
                value={formData.observacoes}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, observacoes: e.target.value }));
                  setHasChanges(true);
                }}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fixed save button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="container max-w-lg mx-auto">
            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar croqui
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalCroqui;
