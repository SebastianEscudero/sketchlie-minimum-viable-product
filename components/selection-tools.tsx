"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";
import { Hint } from "@/components/hint";
import { Camera, Color, LayerType  } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { ColorPicker } from "./color-picker";
import { FontSizePicker } from "./font-picker";


interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
  zoom: number;
  selectedLayers: string[];
  liveLayers: any;
  liveLayerIds: string[];
  setLiveLayers: (layers: any) => void;
  setLiveLayerIds: (ids: string[]) => void;
  lastUsedColor: Color;
};

export const SelectionTools = memo(({
  camera,
  setLastUsedColor,
  zoom,
  selectedLayers,
  setLiveLayers,
  setLiveLayerIds,
  liveLayers,
  liveLayerIds,
  lastUsedColor,
}: SelectionToolsProps) => {

  let isTextLayer = selectedLayers.every(layer => liveLayers[layer]?.type === LayerType.Text);
  let isArrowLayer = selectedLayers.every(layer => liveLayers[layer]?.type === LayerType.Arrow);
  const [initialPosition, setInitialPosition] = useState<{x: number, y: number} | null>(null);
  const selectionBounds = useSelectionBounds(selectedLayers, liveLayers);

  useEffect(() => {
    if (selectionBounds) {
      let x, y;
      if (isArrowLayer) {
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
      setInitialPosition({x, y});
    }
  }, [selectedLayers, camera, zoom]);

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
    setLastUsedColor(fill);
  
    setLiveLayers((prevLayers: any) => {
      const newLayers = { ...prevLayers };
  
      selectedLayers.forEach((id) => {
        const layer = newLayers[id];
        if (layer) {
          newLayers[id].fill = fill;
        }
      });
  
      localStorage.setItem("layers", JSON.stringify(newLayers));
      return newLayers;
    });
  }, [selectedLayers, setLastUsedColor, setLiveLayers]);

  const deleteLayers = useCallback(() => {  
    selectedLayers.forEach((id) => {
      delete liveLayers[id];
    });
  

    setLiveLayers({ ...liveLayers });
    setLiveLayerIds([...liveLayerIds.filter((id) => !selectedLayers.includes(id))]);
    localStorage.setItem('layers', JSON.stringify(liveLayers));
  }, [selectedLayers, liveLayers, setLiveLayers, liveLayerIds, setLiveLayerIds]);

  if (!selectionBounds) {
    return null;
  }

  return (
    <div
      className="absolute p-1 rounded-sm bg-white shadow-sm border flex select-none gap-x-2 items-center"
      style={{
        transform: initialPosition
          ? `translate(
              calc(${initialPosition.x}px - 50%),
              calc(${initialPosition.y - 30}px - 100%)
            )`
          : undefined
      }}
    >
      {isTextLayer && (
        <FontSizePicker
          selectedLayers={selectedLayers}
          setLiveLayers={setLiveLayers}
          liveLayers={liveLayers}
        />
      )}
      <ColorPicker
        lastUsedColor={lastUsedColor}
        onChange={setFill}
      />
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