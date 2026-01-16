import { useCallback, useEffect, useRef, useState } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import type { Polygon as GeoJsonPolygon } from "geojson";
import esriConfig from "@arcgis/core/config";
import { useProperties, useFindNeighbors } from '@/hooks/useGestorMap';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapIcon, Users, Home } from "lucide-react";

interface Property {
  id: string;
  name: string;
  municipality: string;
  objectives: string[];
  owner_id: string;
  geom: string;
}

interface Neighbor {
  neighbor_id: string;
  neighbor_name: string;
  neighbor_owner_id: string;
  distance_m: number;
  touches: boolean;
}

const GestorMapView = () => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  const { data: properties = [], isLoading: loadingProperties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const { toast } = useToast();

  const addPropertyToMap = useCallback((property: Property) => {
    const layer = graphicsLayerRef.current;
    if (!layer) return;

    try {
      const geojsonString = property.geom.replace('SRID=4326;', '');
      const geojson = JSON.parse(geojsonString) as GeoJsonPolygon;
      
      const polygon = new Polygon({
        rings: geojson.coordinates,
        spatialReference: { wkid: 4326 }
      });

      const graphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill",
          color: [51, 204, 51, 0.3],
          outline: {
            color: [51, 204, 51],
            width: 2
          }
        },
        attributes: property
      });

      layer.add(graphic);

    } catch (error) {
      console.error("Erro ao adicionar propriedade ao mapa:", error);
    }
  }, []);

  useEffect(() => {
    if (!loadingProperties && properties.length > 0) {
      properties.forEach(addPropertyToMap);
      toast({
        title: "Propriedades carregadas",
        description: `${properties.length} propriedades encontradas`
      });
    }
  }, [properties, loadingProperties, addPropertyToMap, toast]);

  const findNeighborsMutation = useFindNeighbors();
  const findNeighbors = useCallback(async (propertyId: string) => {
    try {
      const data = await findNeighborsMutation.mutateAsync({ property_id: propertyId, distance_meters: 100 });
      setNeighbors(data ?? []);
      toast({
        title: "Análise de vizinhança",
        description: `${data?.length || 0} vizinhos encontrados`
      });
    } catch (error) {
      console.error("Erro ao buscar vizinhos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível analisar vizinhança",
        variant: "destructive"
      });
    }
  }, [findNeighborsMutation, toast]);

  // Initialize map
  useEffect(() => {
    if (!mapDiv.current) return;

    // Configure API Key
    const apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
    if (apiKey) {
      esriConfig.apiKey = apiKey;
    }

    // Create graphics layer
    const graphicsLayer = new GraphicsLayer();
    graphicsLayerRef.current = graphicsLayer;

    // Create map
    const map = new Map({
      basemap: "osm",
      layers: [graphicsLayer]
    });

    // Create MapView
    const mapView = new MapView({
      container: mapDiv.current,
      map: map,
      center: [-49.2646, -16.6869], // Goiânia, GO
      zoom: 10
    });

    mapView.when(() => {
      console.log("Mapa GESTOR carregado!");
      loadProperties();
    });

    setView(mapView);

    return () => {
      mapView?.destroy();
    };
  }, []);

  // Handle property click
  useEffect(() => {
    if (!view) return;

    const handle = view.on("click", async (event) => {
      const response = await view.hitTest(event);
      
      if (response.results.length > 0) {
        const hitResult = response.results[0];
        if (hitResult.graphic?.attributes) {
          const property = hitResult.graphic.attributes as Property;
          setSelectedProperty(property);
          findNeighbors(property.id);
        }
      }
    });

    return () => {
      handle.remove();
    };
  }, [view, findNeighbors]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapDiv} className="w-full h-full" />
      
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Mapa de Oportunidades - GESTOR</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {properties.length} propriedades cadastradas
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Selected Property Panel */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 z-10 max-w-md">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <CardTitle>{selectedProperty.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Município</p>
                <p className="font-medium">{selectedProperty.municipality}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Serviços solicitados</p>
                <div className="flex flex-wrap gap-1">
                  {selectedProperty.objectives.map((obj, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {obj}
                    </Badge>
                  ))}
                </div>
              </div>

              {neighbors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    <p className="text-sm font-medium">Vizinhos ({neighbors.length})</p>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {neighbors.map((neighbor) => (
                      <div key={neighbor.neighbor_id} className="text-sm p-2 bg-muted rounded">
                        <p className="font-medium">{neighbor.neighbor_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {neighbor.touches ? "🟢 Confrontante" : `📍 ${Math.round(neighbor.distance_m)}m de distância`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GestorMapView;
