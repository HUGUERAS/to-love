import { useEffect, useRef, useState } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Sketch from "@arcgis/core/widgets/Sketch";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Upload, Pencil } from "lucide-react";
import esriConfig from "@arcgis/core/config";
import { useCurrentUser, useCreateProperty } from '@/hooks/useProperty';
import { useToast } from "@/hooks/use-toast";

const ClientMapView = () => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView | null>(null);
  const [sketchWidget, setSketchWidget] = useState<Sketch | null>(null);
  const [currentGeometry, setCurrentGeometry] = useState<__esri.Polygon | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const [step, setStep] = useState<"map" | "form">("map");
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);
  const { toast } = useToast();
  
  // Form state
  const [propertyName, setPropertyName] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [otherService, setOtherService] = useState("");
  const { data: user } = useCurrentUser();
  const createProperty = useCreateProperty();

  const services = [
    "Georreferenciamento (para venda, registro, etc.)",
    "Desmembramento / Remembramento de área",
    "Laudo técnico para processo judicial / disputa de divisas",
    "Cadastro Ambiental Rural (CAR)",
    "Pagamento por Serviços Ambientais (PSA)",
    "Consultoria em inventário",
    "Regularização fundiária (Usucapião, Adquirir área devoluta)",
    "Outro"
  ];

  useEffect(() => {
    if (!mapDiv.current) return;

    console.log("Iniciando carregamento do mapa...");

    // Configure API Key
    const apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
    console.log("API Key configurada:", apiKey ? "Sim" : "Não");
    if (apiKey) {
      esriConfig.apiKey = apiKey;
    }

    // Create graphics layer for drawings
    const graphicsLayer = new GraphicsLayer();
    setGraphicsLayer(graphicsLayer);

    // Create a simple Map with a basemap (instead of WebMap)
    const map = new Map({
      basemap: "osm", // OpenStreetMap - não requer autenticação
      layers: [graphicsLayer]
    });

    // Create MapView
    const mapView = new MapView({
      container: mapDiv.current,
      map: map,
      center: [-49.2646, -16.6869], // Goiânia, GO
      zoom: 10
    });

    // Listen for view ready
    mapView.when(() => {
      console.log("Mapa carregado com sucesso!");
      
      // Create Sketch widget after map loads
      const sketch = new Sketch({
        layer: graphicsLayer,
        view: mapView,
        creationMode: "single",
        availableCreateTools: ["polygon"]
      });

      // Add sketch widget to UI permanently
      mapView.ui.add(sketch, "top-right");
      
      setSketchWidget(sketch);
      
      // Listen for sketch create events
      sketch.on("create", (event) => {
        if (event.state === "complete" && event.graphic.geometry?.type === "polygon") {
          const geometry = event.graphic.geometry as __esri.Polygon;
          setCurrentGeometry(geometry);
          
          // Calculate area
          const area = geometryEngine.geodesicArea(geometry, "hectares");
          setCalculatedArea(Math.abs(area));
          
          setStep("form");
        }
      });
    }).catch((error) => {
      console.error("Erro ao carregar o mapa:", error);
    });

    setView(mapView);

    return () => {
      mapView?.destroy();
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !view || !graphicsLayer) return;

    try {
      // Read file as text
      const text = await file.text();
      
      // Parse KML XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      
      // Extract coordinates from KML
      const coordinatesElement = xmlDoc.querySelector("coordinates");
      if (!coordinatesElement) {
        throw new Error("Nenhuma coordenada encontrada no KML");
      }
      
      const coordsText = coordinatesElement.textContent?.trim();
      if (!coordsText) {
        throw new Error("Coordenadas vazias");
      }
      
      // Parse coordinates (format: "lon,lat,alt lon,lat,alt ...")
      const coords = coordsText
        .split(/\s+/)
        .map(coord => {
          const [lon, lat] = coord.split(",").map(Number);
          return [lon, lat];
        })
        .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
      
      if (coords.length < 3) {
        throw new Error("Polígono precisa de pelo menos 3 pontos");
      }
      
      // Create Esri Polygon geometry
      const polygon = new Polygon({
        rings: [coords],
        spatialReference: { wkid: 4326 }
      });
      
      // Add graphic to map
      const graphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill",
          color: [51, 51, 204, 0.3],
          outline: {
            color: [51, 51, 204],
            width: 2
          }
        }
      });
      
      graphicsLayer.add(graphic);
      setCurrentGeometry(polygon);
      
      // Calculate area
      const area = geometryEngine.geodesicArea(polygon, "hectares");
      setCalculatedArea(Math.abs(area));
      
      // Zoom to geometry
      view.goTo(graphic);
      
      toast({
        title: "KML carregado com sucesso!",
        description: `Área: ${Math.abs(area).toFixed(2)} hectares`
      });

    } catch (error) {
      console.error("Erro ao carregar KML:", error);
      toast({
        title: "Erro ao carregar arquivo",
        description: error instanceof Error ? error.message : "Não foi possível processar o arquivo KML",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!currentGeometry) return;

    try {
      // Convert Esri geometry to GeoJSON
      const rings = currentGeometry.rings?.[0];
      if (!rings) {
        throw new Error("Não foi possível determinar o perímetro desenhado");
      }

      const coordinates = rings.map((point) => [point[0], point[1]]);
      
      // Create GeoJSON polygon
      const geojson = {
        type: "Polygon",
        coordinates: [coordinates]
      };

      if (!user) throw new Error("Usuário não autenticado");
      const data = await createProperty.mutateAsync({
        name: propertyName,
        municipality,
        objectives: selectedServices,
        objective_other: selectedServices.includes("Outro") ? otherService : null,
        geom: `SRID=4326;${JSON.stringify(geojson)}`,
        owner_id: user.id
      });
      console.log("Saving property:", data);
      
      toast({
        title: "Propriedade salva!",
        description: "Sua propriedade foi cadastrada com sucesso."
      });
      
      // Reset form
      setStep("map");
      setPropertyName("");
      setMunicipality("");
      setSelectedServices([]);
      setOtherService("");
      setCurrentGeometry(null);
      setCalculatedArea(null);
      graphicsLayer?.removeAll();
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a propriedade. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapDiv} className="w-full h-full" style={{ backgroundColor: '#e0e0e0' }} />
      
      {/* Floating panel */}
      <div className="absolute top-4 left-4 z-10 max-w-md">
        <Card className="shadow-lg">
          {step === "map" && (
            <>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <CardTitle>Adicione seu Imóvel</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use a ferramenta de desenho no canto superior direito do mapa para marcar o perímetro da sua propriedade, ou carregue um arquivo KML/KMZ.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="kml-upload">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Carregar KML/KMZ
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="kml-upload"
                    type="file"
                    accept=".kml,.kmz"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou carregue arquivo
                    </span>
                  </div>
                </div>

                <Button 
                  variant="default" 
                  className="w-full"
                  disabled
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Ferramentas de desenho estão no mapa →
                </Button>

                {calculatedArea && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-primary/10 text-sm">
                      <strong>Área calculada:</strong> {calculatedArea.toFixed(2)} hectares
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => setStep("form")}
                    >
                      Continuar para Formulário →
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {step === "form" && (
            <>
              <CardHeader>
                <CardTitle>Detalhes do Imóvel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyName">Nome do Imóvel</Label>
                  <Input
                    id="propertyName"
                    placeholder="Ex: Fazenda Boa Esperança"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality">Município</Label>
                  <Input
                    id="municipality"
                    placeholder="Ex: Goiânia"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quais serviços você precisa?</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {services.map((service) => (
                      <div key={service} className="flex items-start space-x-2">
                        <Checkbox
                          id={service}
                          checked={selectedServices.includes(service)}
                          onCheckedChange={() => toggleService(service)}
                        />
                        <Label
                          htmlFor={service}
                          className="text-sm font-normal leading-tight cursor-pointer"
                        >
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedServices.includes("Outro") && (
                  <div className="space-y-2">
                    <Label htmlFor="otherService">Especifique o serviço</Label>
                    <Input
                      id="otherService"
                      placeholder="Descreva o serviço que você precisa"
                      value={otherService}
                      onChange={(e) => setOtherService(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setStep("map");
                      setCalculatedArea(null);
                      setCurrentGeometry(null);
                      if (sketchWidget) {
                        sketchWidget.cancel();
                      }
                    }}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={!propertyName.trim() || !municipality.trim() || selectedServices.length === 0}
                  >
                    Salvar Imóvel
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ClientMapView;
