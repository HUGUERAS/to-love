import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as toGeoJSON from '@tmcw/togeojson';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Pencil, 
  Trash2, 
  Upload, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Locate,
  Layers,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ensureClosedRing = (coords: GeoJSON.Position[]): GeoJSON.Position[] => {
  if (coords.length === 0) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) {
    return coords;
  }
  return [...coords, [...first] as GeoJSON.Position];
};

const lineStringToPolygon = (
  feature: GeoJSON.Feature<GeoJSON.LineString>
): GeoJSON.Feature<GeoJSON.Polygon> | null => {
  const coords = feature.geometry.coordinates;
  if (!coords || coords.length < 2) {
    return null;
  }

  if (coords.length === 2) {
    const [first, second] = coords;
    const midPoint: GeoJSON.Position = [
      (first[0] + second[0]) / 2,
      (first[1] + second[1]) / 2,
    ];
    const dummy = coords[coords.length - 1][2] ?? 0;
    const dir: GeoJSON.Position = [
      midPoint[0],
      midPoint[1] + 0.0001,
      dummy,
    ];
    const safeCoords = [first, dir, second];
    return {
      type: "Feature",
      properties: feature.properties ?? {},
      geometry: {
        type: "Polygon",
        coordinates: [ensureClosedRing(safeCoords)],
      },
    };
  }

  return {
    type: "Feature",
    properties: feature.properties ?? {},
    geometry: {
      type: "Polygon",
      coordinates: [ensureClosedRing(coords)],
    },
  };
};

type PolygonFeatureWithId = GeoJSON.Feature<GeoJSON.Polygon> & {
  id?: string | number;
};

interface CroquiMapProps {
  initialPolygon?: GeoJSON.Feature<GeoJSON.Polygon>;
  onPolygonChange?: (polygon: GeoJSON.Feature<GeoJSON.Polygon> | null, area: number) => void;
  mapboxToken: string;
  center?: [number, number];
  zoom?: number;
}

// Custom draw styles
const drawStyles = [
  {
    'id': 'gl-draw-polygon-fill',
    'type': 'fill',
    'filter': ['all', ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': '#3b82f6',
      'fill-opacity': 0.2
    }
  },
  {
    'id': 'gl-draw-polygon-stroke',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'Polygon']],
    'paint': {
      'line-color': '#3b82f6',
      'line-width': 3
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-active',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
    'paint': {
      'line-color': '#f59e0b',
      'line-width': 4,
      'line-dasharray': [2, 1]
    }
  },
  {
    'id': 'gl-draw-line',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString']],
    'paint': {
      'line-color': '#3b82f6',
      'line-width': 3
    }
  },
  {
    'id': 'gl-draw-point',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
    'paint': {
      'circle-radius': 6,
      'circle-color': '#ffffff',
      'circle-stroke-color': '#3b82f6',
      'circle-stroke-width': 2
    }
  },
  {
    'id': 'gl-draw-point-active',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['==', 'active', 'true']],
    'paint': {
      'circle-radius': 8,
      'circle-color': '#f59e0b',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2
    }
  },
  {
    'id': 'gl-draw-point-midpoint',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#3b82f6',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1
    }
  }
];

// Calculate polygon area in hectares
const calculateArea = (polygon: GeoJSON.Feature<GeoJSON.Polygon>): number => {
  if (!polygon.geometry || !polygon.geometry.coordinates || !polygon.geometry.coordinates[0]) {
    return 0;
  }

  const coords = polygon.geometry.coordinates[0];
  if (coords.length < 4) return 0;

  // Shoelace formula for area calculation
  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  area = Math.abs(area) / 2;

  // Convert to hectares (approximate, using latitude correction)
  const centerLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
  const metersPerDegLat = 111320;
  const metersPerDegLon = 111320 * Math.cos(centerLat * Math.PI / 180);
  
  // Area in square meters
  const areaM2 = area * metersPerDegLat * metersPerDegLon;
  
  // Convert to hectares
  return areaM2 / 10000;
};

export function CroquiMap({ 
  initialPolygon, 
  onPolygonChange, 
  mapboxToken,
  center = [-47.9292, -15.7801], // Brasília area default
  zoom = 10
}: CroquiMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getExistingPolygonId = () => {
    if (!draw.current) return undefined;
    const polygons = draw.current
      .getAll()
      .features.filter((f): f is PolygonFeatureWithId => f.geometry.type === 'Polygon');
    return polygons[0]?.id?.toString();
  };

  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<PolygonFeatureWithId | null>(null);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'streets' | 'hybrid'>('satellite');
  const [isLocating, setIsLocating] = useState(false);

  const { toast } = useToast();

  // Handle polygon updates
  const handlePolygonUpdate = useCallback(() => {
    if (!draw.current) return;

    const data = draw.current.getAll();
    const polygons = data.features.filter(
      (f): f is PolygonFeatureWithId => f.geometry.type === 'Polygon'
    );

    if (polygons.length > 0) {
      const polygon = polygons[0];
      const area = calculateArea(polygon);
      setCurrentPolygon(polygon);
      onPolygonChange?.(polygon, area);
    } else {
      setCurrentPolygon(null);
      onPolygonChange?.(null, 0);
    }
  }, [onPolygonChange]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: center,
      zoom: zoom,
      pitch: 0,
    });

    // Add navigation controls
    mapInstance.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: false }),
      'top-right'
    );

    // Add scale
    mapInstance.addControl(
      new mapboxgl.ScaleControl({ maxWidth: 150, unit: 'metric' }),
      'bottom-left'
    );

    // Initialize draw control
    const drawInstance = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: 'simple_select',
      styles: drawStyles,
    });

    mapInstance.addControl(drawInstance as unknown as mapboxgl.IControl);

    map.current = mapInstance;
    draw.current = drawInstance;

    mapInstance.on('load', () => {
      setIsMapLoaded(true);

      // Load initial polygon if provided
      if (initialPolygon) {
        drawInstance.add(initialPolygon);
        handlePolygonUpdate();

        // Fit to polygon bounds
        const coords = initialPolygon.geometry.coordinates[0];
        const bounds = coords.reduce(
          (bounds, coord) => bounds.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number])
        );
        mapInstance.fitBounds(bounds, { padding: 50 });
      }
    });

    // Draw events
    mapInstance.on('draw.create', handlePolygonUpdate);
    mapInstance.on('draw.update', handlePolygonUpdate);
    mapInstance.on('draw.delete', handlePolygonUpdate);

    return () => {
      mapInstance.remove();
    };
  }, [mapboxToken, center, zoom, initialPolygon, handlePolygonUpdate]);

  // Start drawing mode
  const handleStartDrawing = () => {
    if (!draw.current) return;

    // Clear existing polygons first
    draw.current.deleteAll();
    setCurrentPolygon(null);
    onPolygonChange?.(null, 0);

    // Start polygon drawing
    draw.current.changeMode('draw_polygon');
    setIsDrawing(true);

    toast({
      title: "Modo desenho ativado",
      description: "Clique no mapa para adicionar vértices. Clique no primeiro ponto para fechar o polígono.",
    });
  };

  // Delete polygon
  const handleDeletePolygon = () => {
    if (!draw.current) return;
    
    draw.current.deleteAll();
    setCurrentPolygon(null);
    onPolygonChange?.(null, 0);
    setIsDrawing(false);

    toast({
      title: "Polígono removido",
      description: "Desenhe um novo polígono ou importe um arquivo KML.",
    });
  };

  // Cancel drawing
  const handleCancelDrawing = () => {
    if (!draw.current) return;
    
    draw.current.changeMode('simple_select');
    setIsDrawing(false);
  };

  const handleEditPolygon = () => {
    if (!draw.current) return;
    const featureId = currentPolygon?.id?.toString() ?? getExistingPolygonId();
    if (!featureId) {
      toast({
        title: "Nada para editar",
        description: "Desenhe ou importe um polígono antes de editar.",
        variant: "destructive",
      });
      return;
    }

    draw.current.changeMode('direct_select', { featureId });
  };

  // Import KML file
  const handleImportKML = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draw.current || !map.current) return;

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const kml = parser.parseFromString(text, 'text/xml');
      const geojson = toGeoJSON.kml(kml);

      const polygon = geojson.features
        .map((feature) => {
          if (!feature.geometry) return null;
          if (feature.geometry.type === 'Polygon') {
            return feature as GeoJSON.Feature<GeoJSON.Polygon>;
          }
          if (feature.geometry.type === 'LineString') {
            return lineStringToPolygon(feature as GeoJSON.Feature<GeoJSON.LineString>);
          }
          return null;
        })
        .find((converted): converted is GeoJSON.Feature<GeoJSON.Polygon> => Boolean(converted));

      if (!polygon) {
        toast({
          title: "Erro ao importar",
          description: "Não encontramos polígono nem linha com pontos suficientes neste KML.",
          variant: "destructive",
        });
        return;
      }

      // Clear existing and add new
      draw.current.deleteAll();
      draw.current.add(polygon);
      handlePolygonUpdate();

      // Fit to bounds
      const coords = polygon.geometry.coordinates[0] as [number, number][];
      const bounds = coords.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.current.fitBounds(bounds, { padding: 50 });

      toast({
        title: "KML importado!",
        description: "Polígono carregado com sucesso. Você pode editar os vértices.",
      });
    } catch (error) {
      console.error('Error parsing KML:', error);
      toast({
        title: "Erro ao importar",
        description: "Não foi possível ler o arquivo KML. Verifique o formato.",
        variant: "destructive",
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Change map style
  const handleStyleChange = (style: 'satellite' | 'streets' | 'hybrid') => {
    if (!map.current) return;

    const styles = {
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      streets: 'mapbox://styles/mapbox/streets-v12',
      hybrid: 'mapbox://styles/mapbox/satellite-streets-v12',
    };

    map.current.setStyle(styles[style]);
    setMapStyle(style);
  };

  // Locate user
  const handleLocate = () => {
    if (!map.current) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 14,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Erro de localização",
          description: "Não foi possível obter sua localização.",
          variant: "destructive",
        });
        setIsLocating(false);
      }
    );
  };

  // Zoom controls
  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {/* Hidden file input for KML */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".kml,.kmz"
        className="hidden"
        onChange={handleImportKML}
      />

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-secondary flex items-center justify-center">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        </div>
      )}

      {/* Top toolbar */}
      <div className="absolute top-3 left-3 right-14 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {!currentPolygon && !isDrawing ? (
            <Button 
              size="sm" 
              className="gap-1.5 shadow-lg"
              onClick={handleStartDrawing}
            >
              <Pencil className="w-4 h-4" />
              Desenhar
            </Button>
          ) : isDrawing ? (
            <Button 
              size="sm" 
              variant="secondary"
              className="gap-1.5 shadow-lg"
              onClick={handleCancelDrawing}
            >
              <RotateCcw className="w-4 h-4" />
              Cancelar
            </Button>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="secondary"
                className="gap-1.5 shadow-lg"
                onClick={handleEditPolygon}
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                className="shadow-lg"
                onClick={handleDeletePolygon}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            className="gap-1.5 shadow-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            KML
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" className="shadow-lg">
                <Layers className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStyleChange('satellite')}>
                Satélite
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStyleChange('hybrid')}>
                Híbrido
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStyleChange('streets')}>
                Ruas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Left side controls */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="secondary" 
          className="shadow-lg h-9 w-9"
          onClick={handleLocate}
          disabled={isLocating}
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Locate className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Instructions overlay when drawing */}
      {isDrawing && (
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg">
            <p className="text-sm text-foreground">
              Clique no mapa para adicionar vértices. 
              <strong> Clique no primeiro ponto</strong> para fechar o polígono.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
