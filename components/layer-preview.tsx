"use client";

import { memo } from "react";
import { colorToCss } from "@/lib/utils";
import { LayerType } from "@/types/canvas";
import { Path } from "./canvas-objects/path";
import { Note } from "./canvas-objects/note";
import { Text } from "./canvas-objects/text";
import { Ellipse } from "./canvas-objects/ellipse";
import { Rectangle } from "./canvas-objects/rectangle";
import { Arrow } from "./canvas-objects/arrow";
import { Rhombus } from "./canvas-objects/rhombus";
import { Triangle } from "./canvas-objects/triangle";
import { Star } from "./canvas-objects/star";
import { Hexagon } from "./canvas-objects/hexagon";
import { CommentBubble } from "./canvas-objects/commentBubble";
import { Line } from "./canvas-objects/line";
import { BigArrowLeft } from "./canvas-objects/bigArrowLeft";
import { BigArrowRight } from "./canvas-objects/bigArrowRight";
import { BigArrowUp } from "./canvas-objects/bigArrowUp";
import { BigArrowDown } from "./canvas-objects/bigArrowDown";

interface LayerPreviewProps {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
  layer: any;
  setLiveLayers: (layers: any) => void;
  onRefChange?: (ref: React.RefObject<any>) => void;
  zoomRef?: React.RefObject<any>;
};

export const LayerPreview = memo(({
  id,
  onLayerPointerDown,
  selectionColor,
  layer,
  setLiveLayers,
  onRefChange,
  zoomRef
}: LayerPreviewProps) => {

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
          strokeSize={layer.strokeSize}
          zoomRef={zoomRef}
        />
      )
    case LayerType.Note:
      return (
        <Note
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
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
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
        />
      );
    case LayerType.Rectangle:
      return (
        <Rectangle
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
        />
      );
    case LayerType.Rhombus:
      return (
        <Rhombus
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
        />
      );
    case LayerType.Triangle:
      return (
        <Triangle
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
        />
      );
    case LayerType.Star:
      return (
        <Star
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
        />
      );
    case LayerType.Hexagon:
      return (
        <Hexagon
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
        />
      );
      case LayerType.CommentBubble:
        return (
          <CommentBubble
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
            onRefChange={onRefChange}
            setLiveLayers={setLiveLayers}
          />
      );
      case LayerType.Line:
        return (
          <Line
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
      );
    case LayerType.BigArrowLeft:
      return (
        <BigArrowLeft
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
        />
      );
    case LayerType.BigArrowRight:
      return (
        <BigArrowRight
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
        />
      );
    case LayerType.BigArrowUp:
      return (
        <BigArrowUp
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
          onRefChange={onRefChange}
          setLiveLayers={setLiveLayers}
        />
      );
      case LayerType.BigArrowDown:
        return (
          <BigArrowDown
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
            onRefChange={onRefChange}
            setLiveLayers={setLiveLayers}
          />
        );
    case LayerType.Arrow:
      return (
        <Arrow
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