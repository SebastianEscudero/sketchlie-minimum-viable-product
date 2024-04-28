export type Color = {
    r: number;
    g: number;
    b: number;
  };
  
  export type Camera = {
    x: number;
    y: number;
  };
  
  export enum LayerType {
    Rectangle,
    Ellipse,
    Path,
    Text,
    Note,
    Image,
  };
  
  export type RectangleLayer = {
    type: LayerType.Rectangle;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color | null;
    value?: string;
  };
  
  export type EllipseLayer = {
    type: LayerType.Ellipse;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color | null;
    value?: string;
  };
  
  export type PathLayer = {
    type: LayerType.Path;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color | null;
    points: number[][];
    value?: string;
  };
  
  export type TextLayer = {
    type: LayerType.Text;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color | null;
    value?: string;
    textFontSize: number;
  };
  
  export type NoteLayer = {
    type: LayerType.Note;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color | null;
    value?: string;
  };
  
  export type ImageLayer = {
    type: LayerType.Image;
    x: number;
    y: number;
    width: number;
    height: number;
    src: string;
    fill: Color | null;
    value?: string;
  };
  
  export type Point = {
    x: number;
    y: number;
  };
  
  export type XYWH = {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  export enum Side {
    Top = 1,
    Bottom = 2,
    Left = 4,
    Right = 8,
  };
  
  export type CanvasState = 
    | {
        mode: CanvasMode.None;
      }
    | {
        mode: CanvasMode.SelectionNet,
        origin: Point;
        current?: Point;
      }
    | {
        mode: CanvasMode.Translating,
        current: Point;
      }
    | {
        mode: CanvasMode.Inserting,
        layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note | LayerType.Image | LayerType.Path;
      }
    | {
        mode: CanvasMode.Pencil,
      }
    | {
        mode: CanvasMode.Pressing,
        origin: Point;
      }
    | {
        mode: CanvasMode.Resizing,
        initialBounds: XYWH;
        corner: Side;
      }
    | {
        mode: CanvasMode.Moving,
    }
  
  export enum CanvasMode {
    None,
    Pressing,
    SelectionNet,
    Translating,
    Inserting,
    Resizing,
    Pencil,
    Moving
  };
  
  export type Layer = RectangleLayer | EllipseLayer | PathLayer | TextLayer | NoteLayer | ImageLayer;

  export interface Layers {
    [key: string]: Layer;
} 
 