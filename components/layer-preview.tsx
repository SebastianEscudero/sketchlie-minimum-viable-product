"use client";

import { memo } from "react";
import { colorToCss } from "@/lib/utils";
import { LayerType } from "@/types/canvas";
import { Text } from "@/components/canvas-objects/text";
import { Ellipse } from "@/components/canvas-objects/ellipse";
import { Rectangle } from "@/components/canvas-objects/rectangle";
import { Note } from "@/components/canvas-objects/note";
import { Path } from "@/components/canvas-objects/path";
import { InsertImage } from "./canvas-objects/image";

interface LayerPreviewProps {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
  liveLayers: any;
  setLiveLayers: (layers: any) => void;
  onRefChange?: (ref: React.RefObject<any>) => void;
};

export const LayerPreview = memo(({
  id,
  onLayerPointerDown,
  selectionColor,
  liveLayers,
  setLiveLayers,
  onRefChange,
}: LayerPreviewProps) => {
  
  const layer = liveLayers[id];

  if (!layer) {
    return null;
  }

  switch (layer.type) {
    case LayerType.Path:
      return (
        <Path
          key={id}
          points={layer.points}
          onPointerDown={(e) => onLayerPointerDown(e, id)}
          x={layer.x}
          y={layer.y}
          fill={layer.fill ? colorToCss(layer.fill) : "#000"}
          stroke={selectionColor}
        />
      )
    case LayerType.Note:
      return (
        <Note
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    case LayerType.Text:
      return (
        <Text
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    case LayerType.Ellipse:
      return (
        <Ellipse
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    case LayerType.Rectangle:
      return (
        <Rectangle
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
      case LayerType.Image:
        return (
          <InsertImage
            isUploading={false}
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      default:
      return null;
  }
});

LayerPreview.displayName = "LayerPreview";