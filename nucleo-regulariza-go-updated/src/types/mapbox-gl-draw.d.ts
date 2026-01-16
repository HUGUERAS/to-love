declare module '@mapbox/mapbox-gl-draw' {
  import { IControl, Map } from 'mapbox-gl';

  interface DrawOptions {
    displayControlsDefault?: boolean;
    controls?: {
      point?: boolean;
      line_string?: boolean;
      polygon?: boolean;
      trash?: boolean;
      combine_features?: boolean;
      uncombine_features?: boolean;
    };
    defaultMode?: string;
    styles?: object[];
    modes?: object;
    userProperties?: boolean;
    keybindings?: boolean;
    touchEnabled?: boolean;
    boxSelect?: boolean;
    clickBuffer?: number;
    touchBuffer?: number;
  }

  interface DrawModes {
    SIMPLE_SELECT: 'simple_select';
    DIRECT_SELECT: 'direct_select';
    DRAW_LINE_STRING: 'draw_line_string';
    DRAW_POLYGON: 'draw_polygon';
    DRAW_POINT: 'draw_point';
  }

  class MapboxDraw implements IControl {
    constructor(options?: DrawOptions);
    static modes: DrawModes;
    
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
    
    add(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection): string[];
    get(featureId: string): GeoJSON.Feature | undefined;
    getFeatureIdsAt(point: { x: number; y: number }): string[];
    getSelectedIds(): string[];
    getSelected(): GeoJSON.FeatureCollection;
    getSelectedPoints(): GeoJSON.FeatureCollection;
    getAll(): GeoJSON.FeatureCollection;
    delete(ids: string | string[]): this;
    deleteAll(): this;
    set(featureCollection: GeoJSON.FeatureCollection): string[];
    trash(): this;
    combineFeatures(): this;
    uncombineFeatures(): this;
    getMode(): string;
    changeMode(mode: string, options?: object): this;
    setFeatureProperty(featureId: string, property: string, value: unknown): this;
  }

  export default MapboxDraw;
}
