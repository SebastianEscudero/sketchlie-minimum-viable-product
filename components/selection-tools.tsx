"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { BringToFront, Copy, SendToBack, Trash2 } from "lucide-react";
import { Hint } from "@/components/hint";
import { Camera, Color, LayerType } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { ColorPicker } from "./color-picker";
import { FontSizePicker } from "./font-picker";
import { OutlineColorPicker } from "./outline-color-picker";
import { ArrowHeadSelection } from "./arrow-head-selection";
import { PathStokeSizeSelection } from "./stroke-size-selection";
import { customAlphabet } from "nanoid";

interface SelectionToolsProps {
  camera: Camera;
  zoom: number;
  selectedLayers: string[];
  liveLayers: any;
  liveLayerIds: string[];
  setLiveLayers: (layers: any) => void;
  setLiveLayerIds: (ids: string[]) => void;
  DeleteLayerCommand: any;
  InsertLayerCommand: any;
  performAction: any;
};

export const SelectionTools = memo(({
  camera,
  zoom,
  selectedLayers,
  setLiveLayers,
  setLiveLayerIds,
  liveLayers,
  liveLayerIds,
  DeleteLayerCommand,
  InsertLayerCommand,
  performAction,
}: SelectionToolsProps) => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 21);

  const hasText = selectedLayers.every(layer =>
    liveLayers[layer]?.type === LayerType.Text ||
    liveLayers[layer]?.type === LayerType.Note ||
    liveLayers[layer]?.type === LayerType.Rectangle ||
    liveLayers[layer]?.type === LayerType.Ellipse ||
    liveLayers[layer]?.type === LayerType.Rhombus ||
    liveLayers[layer]?.type === LayerType.Triangle ||
    liveLayers[layer]?.type === LayerType.Star ||
    liveLayers[layer]?.type === LayerType.Hexagon ||
    liveLayers[layer]?.type === LayerType.BigArrowLeft ||
    liveLayers[layer]?.type === LayerType.BigArrowRight ||
    liveLayers[layer]?.type === LayerType.BigArrowUp ||
    liveLayers[layer]?.type === LayerType.BigArrowDown ||
    liveLayers[layer]?.type === LayerType.CommentBubble
  );

  const hasOutline = selectedLayers.every(layer =>
    liveLayers[layer]?.type === LayerType.Note ||
    liveLayers[layer]?.type === LayerType.Rectangle ||
    liveLayers[layer]?.type === LayerType.Ellipse ||
    liveLayers[layer]?.type === LayerType.Rhombus ||
    liveLayers[layer]?.type === LayerType.Triangle ||
    liveLayers[layer]?.type === LayerType.Star ||
    liveLayers[layer]?.type === LayerType.Hexagon ||
    liveLayers[layer]?.type === LayerType.BigArrowLeft ||
    liveLayers[layer]?.type === LayerType.BigArrowRight ||
    liveLayers[layer]?.type === LayerType.BigArrowUp ||
    liveLayers[layer]?.type === LayerType.BigArrowDown ||
    liveLayers[layer]?.type === LayerType.CommentBubble
  );
  const isArrowLayer = selectedLayers.every(layer => liveLayers[layer]?.type === LayerType.Arrow);
  const isLineLayer = selectedLayers.every(layer => liveLayers[layer]?.type === LayerType.Line);
  const isPathLayer = selectedLayers.every(layer => liveLayers[layer]?.type === LayerType.Path);

  const layers = selectedLayers.map(id => liveLayers[id]);
  const [initialPosition, setInitialPosition] = useState<{ x: number, y: number } | null>(null);
  const selectionBounds = useSelectionBounds(selectedLayers, liveLayers);

  useEffect(() => {
    if (selectionBounds) {
      let x, y;
      if (isArrowLayer || isLineLayer) {
        const arrowLayer = liveLayers[selectedLayers[0]];
        const centerY = arrowLayer.center.y
        const startY = arrowLayer.y
        const endY = arrowLayer.y + arrowLayer.height
        x = (arrowLayer.width / 2 + arrowLayer.x) * zoom + camera.x;
        y = Math.min(centerY, startY, endY) * zoom + camera.y;
      } else {
        x = (selectionBounds.width / 2 + selectionBounds.x) * zoom + camera.x;
        y = (selectionBounds.y) * zoom + camera.y;
      }
      setInitialPosition({ x, y });
    }
  }, [selectedLayers, zoom, camera, liveLayers]);

  const moveToFront = useCallback(() => {
    const indices: number[] = [];

    if (!liveLayerIds) {
      return;
    }

    let arr = [...liveLayerIds];

    for (let i = 0; i < arr.length; i++) {
      if (selectedLayers.includes(arr[i])) {
        indices.push(i);
      }
    }

    const move = (arr: any[], fromIndex: number, toIndex: number) => {
      var element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, element);
    }

    for (let i = 0; i < indices.length; i++) {
      move(arr, indices[i], arr.length - indices.length + i);
    }

    setLiveLayerIds(arr);
    localStorage.setItem("layerIds", JSON.stringify(arr));
  }, [selectedLayers, setLiveLayerIds, liveLayerIds]);

  const moveToBack = useCallback(() => {
    const indices: number[] = [];

    if (!liveLayerIds) {
      return;
    }

    let arr = [...liveLayerIds];

    for (let i = 0; i < arr.length; i++) {
      if (selectedLayers.includes(arr[i])) {
        indices.push(i);
      }
    }

    const move = (arr: any[], fromIndex: number, toIndex: number) => {
      var element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, element);
    }

    for (let i = 0; i < indices.length; i++) {
      move(arr, indices[i], i);
    }

    setLiveLayerIds(arr);
    localStorage.setItem("layerIds", JSON.stringify(arr));
  }, [selectedLayers, setLiveLayerIds, liveLayerIds]);

  const setFill = useCallback((fill: Color) => {
    setLiveLayers((prevLayers: any) => {
      const newLayers = { ...prevLayers };
      const updatedIds: any = [];
      const updatedLayers: any = [];

      selectedLayers.forEach((id) => {
        const layer = newLayers[id];
        if (layer) {
          newLayers[id] = { ...layer, fill: fill };
          updatedIds.push(id);
          updatedLayers.push(newLayers[id]);
        }
      });
      localStorage.setItem("layers", JSON.stringify(newLayers));
      return newLayers;
    });

  }, [selectedLayers, setLiveLayers]);

  const setOutlineFill = useCallback((outlineFill: Color) => {
    setLiveLayers((prevLayers: any) => {
      const newLayers = { ...prevLayers };
      const updatedIds: any = [];
      const updatedLayers: any = [];

      selectedLayers.forEach((id) => {
        const layer = newLayers[id];
        if (layer) {
          newLayers[id] = { ...layer, outlineFill: outlineFill };
          updatedIds.push(id);
          updatedLayers.push(newLayers[id]);
        }
      });

      localStorage.setItem("layers", JSON.stringify(newLayers));
      return newLayers;
    });
  }, [selectedLayers, setLiveLayers]);

  const duplicateLayers = useCallback(() => {  
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    selectedLayers.forEach((id) => {
      const layer = liveLayers[id];
      minX = Math.min(minX, layer.x);
      minY = Math.min(minY, layer.y);
      maxX = Math.max(maxX, layer.x + layer.width);
      maxY = Math.max(maxY, layer.y + layer.height);
    });
  
    const offsetX = maxX - minX + 10; // Offset by 10 units for visibility
  
    const newSelection = [] as string[];
    const newLiveLayers = { ...liveLayers };
    const newLiveLayerIds = [...liveLayerIds];
    const newIds: any = [];
    const clonedLayers: any = [];
    selectedLayers.forEach((id) => {
      const layer = liveLayers[id];
      const newId = nanoid();
      newSelection.push(newId);
      newLiveLayerIds.push(newId);
      const clonedLayer = JSON.parse(JSON.stringify(layer));
      clonedLayer.x = clonedLayer.x + offsetX;
      if (clonedLayer.type === LayerType.Arrow || clonedLayer.type === LayerType.Line) {
        clonedLayer.center.x += offsetX;
      }
      newLiveLayers[newId] = clonedLayer;
      newIds.push(newId);
      clonedLayers.push(clonedLayer);
    });
  
    const command = new InsertLayerCommand(newIds, clonedLayers, liveLayers, liveLayerIds, setLiveLayers, setLiveLayerIds);
    performAction(command);
    setLiveLayers(newLiveLayers);
    setLiveLayerIds(newLiveLayerIds);
  }, [selectedLayers, setLiveLayers, setLiveLayerIds, liveLayerIds, liveLayers]);

const deleteLayers = useCallback(() => {
  let newLiveLayers = { ...liveLayers };
  let newLiveLayerIds = liveLayerIds.filter(id => !selectedLayers.includes(id));

  // Create an object mapping layer IDs to layer objects
  const layersToDelete: { [key: string]: any } = {};
  selectedLayers.forEach(id => {
      layersToDelete[id] = liveLayers[id];
  });

  const command = new DeleteLayerCommand(selectedLayers, layersToDelete, liveLayers, liveLayerIds, setLiveLayers, setLiveLayerIds);
  performAction(command);

  selectedLayers.forEach((id) => {
    delete newLiveLayers[id];
  });

  setLiveLayers(newLiveLayers);
  setLiveLayerIds(newLiveLayerIds);
}, [liveLayers, liveLayerIds, selectedLayers, setLiveLayers, setLiveLayerIds, performAction, DeleteLayerCommand]);

  if (!selectionBounds) {
    return null;
  }

  return (
    <div
      className="absolute p-1 rounded-sm bg-white shadow-sm border flex select-none gap-x-2 items-center"
      style={{
        transform: initialPosition
          ? `translate(
          calc(${initialPosition.x < 265 ? 265 : initialPosition.x + 205 > window.innerWidth ? window.innerWidth - 205 : initialPosition.x}px - 50%),
          ${initialPosition.y < 130
            ? `calc(${initialPosition.y + selectionBounds.height * zoom + 30}px)`
            : `calc(${initialPosition.y - 30}px - 100%)`
          }
        )`
          : undefined
      }}
    >
      {isPathLayer && (
        <PathStokeSizeSelection
          selectedLayers={selectedLayers}
          setLiveLayers={setLiveLayers}
          liveLayers={liveLayers}
        />
      )}
      {isArrowLayer && (
        <ArrowHeadSelection
          selectedLayers={selectedLayers}
          setLiveLayers={setLiveLayers}
          liveLayers={liveLayers}
        />
      )}
      {hasText && (
        <FontSizePicker
          selectedLayers={selectedLayers}
          setLiveLayers={setLiveLayers}
          liveLayers={liveLayers}
        />
      )}
      {hasOutline && (
        <OutlineColorPicker
          layers={layers}
          onChange={setOutlineFill}
        />
      )}
        <ColorPicker
          layers={layers}
          onChange={setFill}
        />
      <Hint label="Duplicate">
        <Button
          onClick={duplicateLayers}
          variant="board"
          size="icon"
        >
          <Copy />
        </Button>
      </Hint>
      <Hint label="Bring to front">
        <Button
          onClick={moveToFront}
          variant="board"
          size="icon"
        >
          <BringToFront />
        </Button>
      </Hint>
      <Hint label="Send to back" side="bottom">
        <Button
          onClick={moveToBack}
          variant="board"
          size="icon"
        >
          <SendToBack />
        </Button>
      </Hint>
      <div className="flex items-center pl-2 border-l border-neutral-200">
        <Hint label="Delete">
          <Button
            variant="board"
            size="icon"
            onClick={deleteLayers}
          >
            <Trash2 />
          </Button>
        </Hint>
      </div>
    </div>
  );
});

SelectionTools.displayName = "SelectionTools";