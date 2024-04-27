"use client";

import { nanoid } from "nanoid";
import { useCallback, useState, useEffect } from "react";
import {
    colorToCss,
    findIntersectingLayersWithRectangle,
    penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeBounds,
} from "@/lib/utils";
import {
    Camera,
    CanvasMode,
    CanvasState,
    Color,
    Layers,
    LayerType,
    Point,
    Side,
    XYWH,
} from "@/types/canvas";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";

import { Path } from "@/components/canvas-objects/path";
import { Toolbar } from "./toolbar";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Info } from "./info";
import { SketchlieBlock } from "./sketchlie-block";
import { BottomCanvasLinks } from "./bottom-canvas-links";

export const Canvas = () => {
    const [isClickingLayer, setIsClickingLayer] = useState(false);
    const [liveLayers, setLiveLayers] = useState<Layers>({});
    const [liveLayersId, setLiveLayersId] = useState<string[]>([]);
    const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
    const [zoom, setZoom] = useState(1);
    const [copiedLayers, setCopiedLayers] = useState<Map<string, any>>(new Map());
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [pencilDraft, setPencilDraft] = useState<number[][]>([[]]);    
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [rightClickPanning, setIsRightClickPanning] = useState(false);
    const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });

    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 0,
        g: 0,
        b: 0,
    });

    useEffect(() => {
        const storedLayers = localStorage.getItem('layers');
        const storedLayerIds = localStorage.getItem('layerIds');
        if (storedLayers) {
          setLiveLayers(JSON.parse(storedLayers));
        }
        if (storedLayerIds) {
          setLiveLayersId(JSON.parse(storedLayerIds));
        }
      }, []);

    useDisableScrollBounce();

    const insertLayer = useCallback((layerType: LayerType, position: Point) => {
        const layerId = nanoid();
        const layer = {
            type: layerType,
            x: position.x,
            y: position.y,
            height: 100,
            width: 100,
            fill: lastUsedColor,
        };

        const newLayers = { ...liveLayers, [layerId]: layer };
        const newLayerIds = [...liveLayersId, layerId];

        setLiveLayersId(newLayerIds);
        setLiveLayers(newLayers as Layers);

        localStorage.setItem("layerIds", JSON.stringify(newLayerIds));
        localStorage.setItem("layers", JSON.stringify(newLayers));

        setCanvasState({ mode: CanvasMode.None });
    }, [lastUsedColor, liveLayers, liveLayersId]);

    const translateSelectedLayers = useCallback((point: Point) => {
        if (canvasState.mode !== CanvasMode.Translating) {
          return;
        }
      
        const offset = {
            x: (point.x - canvasState.current.x),
            y: (point.y - canvasState.current.y)
          };
        
      
        const newLayers = { ...liveLayers };
      
        selectedLayers.forEach(id => {
            const layer = newLayers[id];
            
            if (layer) {
              const newLayer = { ...layer };
              newLayer.x += offset.x;
              newLayer.y += offset.y;
              newLayers[id] = newLayer;
            }
          });
          
        setLiveLayers(newLayers);
        localStorage.setItem("layers", JSON.stringify(newLayers));
        setCanvasState({ mode: CanvasMode.Translating, current: point });
      }, [canvasState, liveLayers, selectedLayers]);

    const unselectLayers = useCallback(() => {
        if (selectedLayers.length > 0) {
            setSelectedLayers([]);
        }
    }, [selectedLayers]);

    const updateSelectionNet = useCallback((current: Point, origin: Point) => {
        setCanvasState({
            mode: CanvasMode.SelectionNet,
            origin,
            current,
        });

        const ids = findIntersectingLayersWithRectangle(
            liveLayersId,
            liveLayers,
            origin,
            current,
        );

        setSelectedLayers(ids);
    }, [liveLayers, liveLayersId]);

    const startMultiSelection = useCallback((
        current: Point,
        origin: Point,
    ) => {
        if (
            Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5
        ) {
            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current,
            });
        }
    }, []);

    const continueDrawing = useCallback((point: Point, e: React.PointerEvent) => {
        if (
            canvasState.mode !== CanvasMode.Pencil ||
            e.buttons !== 1 ||
            pencilDraft == null
        ) {
            return;
        }

        setPencilDraft(pencilDraft.length === 1 &&
            pencilDraft[0][0] === point.x &&
            pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]]);

        localStorage.setItem("pencilDraft", JSON.stringify(pencilDraft));
    }, [canvasState.mode, pencilDraft]);

    const insertPath = useCallback(() => {
        if (
            pencilDraft == null ||
            pencilDraft.length < 2
        ) {
            setPencilDraft([[]]);
            return;
        }

        const id = nanoid();
        liveLayers[id] = penPointsToPathLayer(pencilDraft, lastUsedColor);

        const liveLayerIds = JSON.parse(localStorage.getItem("layerIds") || '[]');
        liveLayerIds.push(id);

        setPencilDraft([[]]);
        setLiveLayers({ ...liveLayers });
        setLiveLayersId([...liveLayerIds]);
        localStorage.setItem("layers", JSON.stringify(liveLayers));
        localStorage.setItem("layerIds", JSON.stringify(liveLayerIds));

        setCanvasState({ mode: CanvasMode.Pencil });
    }, [lastUsedColor, pencilDraft, liveLayers]);

    const startDrawing = useCallback((point: Point, pressure: number) => {
        const pencilDraft = [[point.x, point.y, pressure]];
        setPencilDraft(pencilDraft);
        localStorage.setItem("pencilDraft", JSON.stringify(pencilDraft));
    }, []);

    const resizeSelectedLayer = useCallback((point: Point) => {
        if (canvasState.mode !== CanvasMode.Resizing) {
            return;
        }


        const layer = liveLayers[selectedLayers[0]];

        const bounds = resizeBounds(
            layer?.type,
            canvasState.initialBounds,
            canvasState.corner,
            point,
        );

        if (layer) {
            Object.assign(layer, bounds);
            liveLayers[selectedLayers[0]] = layer;
            setLiveLayers({ ...liveLayers });
            localStorage.setItem("layers", JSON.stringify(liveLayers));
        }
    }, [canvasState, liveLayers, selectedLayers]);

    const onResizeHandlePointerDown = useCallback((
        corner: Side,
        initialBounds: XYWH,
    ) => {
        setCanvasState({
            mode: CanvasMode.Resizing,
            initialBounds,
            corner,
        });
    }, []);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const onWheel = useCallback((e: React.WheelEvent) => {
        const svgRect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const y = e.clientY - svgRect.top;

        if (e.ctrlKey) {
            let newZoom = zoom;
            if (e.deltaY < 0) {
                newZoom = Math.min(zoom * 1.1, 3);
            } else {
                newZoom = Math.max(zoom / 1.1, 0.5);
            }

            const zoomFactor = newZoom / zoom;
            const newX = x - (x - camera.x) * zoomFactor;
            const newY = y - (y - camera.y) * zoomFactor;

            setZoom(newZoom);
            setCamera({ x: newX, y: newY });
        }
        else {
            setCamera((camera) => ({
                x: camera.x - e.deltaX / zoom,
                y: camera.y - e.deltaY / zoom,
            }));
        }
    }, [zoom, camera]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        e.preventDefault();

        if (rightClickPanning) {
            const newCameraPosition = {
                x: camera.x + e.clientX - startPanPoint.x,
                y: camera.y + e.clientY - startPanPoint.y,
            };
            setCamera(newCameraPosition);
            setStartPanPoint({ x: e.clientX, y: e.clientY });
        }

        if (canvasState.mode === CanvasMode.Moving && isPanning) {
            const newCameraPosition = {
                x: camera.x + e.clientX - startPanPoint.x,
                y: camera.y + e.clientY - startPanPoint.y,
            };
            setCamera(newCameraPosition);
            setStartPanPoint({ x: e.clientX, y: e.clientY });
        }
        const current = pointerEventToCanvasPoint(e, camera, zoom);

        if (canvasState.mode === CanvasMode.Pressing) {
            startMultiSelection(current, canvasState.origin);
        } else if (canvasState.mode === CanvasMode.SelectionNet) {
            updateSelectionNet(current, canvasState.origin);
        } else if (canvasState.mode === CanvasMode.Translating) {
            translateSelectedLayers(current);
        } else if (canvasState.mode === CanvasMode.Resizing) {
            resizeSelectedLayer(current);
        } else if (canvasState.mode === CanvasMode.Pencil) {
            continueDrawing(current, e);
        }
    },
        [
            continueDrawing,
            camera,
            canvasState,
            resizeSelectedLayer,
            translateSelectedLayers,
            startMultiSelection,
            updateSelectionNet,
            isPanning,
            rightClickPanning,
            setCamera,
            zoom,
            startPanPoint
        ]);

    const onPointerDown = useCallback((
        e: React.PointerEvent,
    ) => {
        const point = pointerEventToCanvasPoint(e, camera, zoom);

        if (e.button === 0) {
            if (canvasState.mode === CanvasMode.Moving) {
                setIsPanning(true);
                setStartPanPoint({ x: e.clientX, y: e.clientY });
                document.body.style.cursor = 'grabbing';
            }

            if (canvasState.mode === CanvasMode.Inserting) {
                return;
            }

            if (canvasState.mode === CanvasMode.Moving) {
                return;
            }

            if (canvasState.mode === CanvasMode.Pencil) {
                startDrawing(point, e.pressure);
                return;
            }

            setCanvasState({ origin: point, mode: CanvasMode.Pressing });
        } else if (e.button === 2) {
            setIsRightClickPanning(true);
            setStartPanPoint({ x: e.clientX, y: e.clientY });
            document.body.style.cursor = 'grabbing';
        }
    }, [camera, canvasState.mode, setCanvasState, startDrawing, setIsPanning, setIsRightClickPanning, zoom]);

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        setIsRightClickPanning(false);
        document.body.style.cursor = 'default';
        const point = pointerEventToCanvasPoint(e, camera, zoom);
        if (canvasState.mode === CanvasMode.Moving) {
            document.body.style.cursor = 'pointer';
        }
        if (
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Pressing
        ) {
            setIsClickingLayer(false);
            unselectLayers();
            setCanvasState({
                mode: CanvasMode.None,
            });
        } else if (canvasState.mode === CanvasMode.Pencil) {
            insertPath();
        } else if (canvasState.mode === CanvasMode.Inserting) {
            insertLayer(canvasState.layerType, point);
        } else if (canvasState.mode === CanvasMode.Moving) {
            setIsPanning(false);
        } else {
            setCanvasState({
                mode: CanvasMode.None,
            });
        }

    },
        [
            setCanvasState,
            camera,
            canvasState,
            insertLayer,
            unselectLayers,
            insertPath,
            setIsPanning,
            zoom,
        ]);

    const onLayerPointerDown = useCallback((e: React.PointerEvent, layerId: string) => {
        setIsClickingLayer(true);

        if (
            canvasState.mode === CanvasMode.Pencil ||
            canvasState.mode === CanvasMode.Inserting
        ) {
            return;
        }

        e.stopPropagation();

        const point = pointerEventToCanvasPoint(e, camera, zoom);
        setCanvasState({ mode: CanvasMode.Translating, current: point });

        if (selectedLayers.includes(layerId)) {
            return;
        }

        setSelectedLayers([layerId]);

    }, [setCanvasState, camera, canvasState.mode, zoom, selectedLayers]);

    const copySelectedLayers = useCallback(() => {
        const copied = new Map();
        for (const id of selectedLayers) {
          const layer = liveLayers[id];
          if (layer) {
            // Deep copy the layer object
            const copiedLayer = JSON.parse(JSON.stringify(layer));
            copied.set(id, copiedLayer);
          }
        }
        setCopiedLayers(copied);
        console.log(copied)
      }, [selectedLayers, liveLayers]);
      
      const pasteCopiedLayers = useCallback((mousePosition: any) => {
        let minX = Infinity;
        let minY = Infinity;
        copiedLayers.forEach((layer) => {
          minX = Math.min(minX, layer.x);
          minY = Math.min(minY, layer.y);
        });
      
        // Calculate the offset from the mouse position
        const offsetX = mousePosition.x - minX;
        const offsetY = mousePosition.y - minY;
      
        const newSelection = [];
        const newLiveLayers = { ...liveLayers };
        const newLiveLayerIds = [...liveLayersId];
        copiedLayers.forEach((layer, id) => {
          const newId = nanoid();
          newSelection.push(newId);
          newLiveLayerIds.push(newId);
          const clonedLayer = { ...layer };
          clonedLayer.x = clonedLayer.x + offsetX; // Adjust x position
          clonedLayer.y = clonedLayer.y + offsetY; // Adjust y position
          newLiveLayers[newId] = clonedLayer;
        });
      
        setLiveLayers(newLiveLayers);
        setLiveLayersId(newLiveLayerIds);
        localStorage.setItem("layers", JSON.stringify(newLiveLayers));
        localStorage.setItem("layerIds", JSON.stringify(newLiveLayerIds));
      }, [copiedLayers, liveLayers, liveLayersId]);

    useEffect(() => {
        let animationFrameId: number | null = null;
      
        function onPointerMove(e: PointerEvent) {
          // Cancel the previous animation frame
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
          }
      
          // Request a new animation frame
          animationFrameId = requestAnimationFrame(() => {
            setMousePosition({
              x: (Math.round(e.clientX) - camera.x) / zoom,
              y: (Math.round(e.clientY) - camera.y) / zoom,
            });
          });
        }
      
        document.addEventListener("pointermove", onPointerMove);
      
        return () => {
          document.removeEventListener("pointermove", onPointerMove);
      
          // Cancel the animation frame when the component unmounts
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
          }
        };
      }, [camera, mousePosition, setMousePosition, zoom]);

      useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
          switch (e.key.toLocaleLowerCase()) {
            case "c": {
              if (e.ctrlKey || e.metaKey) {
                copySelectedLayers();
              }
              break;
            }
            case "v": {
              if (e.ctrlKey || e.metaKey) {
                if (isClickingLayer === false) {
                  pasteCopiedLayers(mousePosition);
                }
              }
              break;
            }
          }
        }

        document.addEventListener("keydown", onKeyDown);

        return () => {
          document.removeEventListener("keydown", onKeyDown)
        }
      }, [copySelectedLayers, pasteCopiedLayers, mousePosition, isClickingLayer]);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const handleContextMenu = (e: MouseEvent) => {
                e.preventDefault();
            };

            document.addEventListener('contextmenu', handleContextMenu);

            return () => {
                document.removeEventListener('contextmenu', handleContextMenu);
            };
        }
    }, []);

    useEffect(() => {
        if (canvasState.mode === CanvasMode.Moving) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [canvasState.mode]);

    return (
        <main
            className="h-full w-full relative bg-neutral-100 touch-none overscroll-none" style={{ backgroundImage: "url(/dot-grid.png)", backgroundSize: 'cover' }}
        >
            <Info 
                setLiveLayers={setLiveLayers}
                setLiveLayersId={setLiveLayersId}
            />
            <SketchlieBlock />
            <BottomCanvasLinks />
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
            />
            <SelectionTools
                setLiveLayerIds={setLiveLayersId}
                setLiveLayers={setLiveLayers}
                liveLayerIds={liveLayersId}
                liveLayers={liveLayers}
                selectedLayers={selectedLayers}
                zoom={zoom}
                camera={camera}
                setLastUsedColor={setLastUsedColor}
            />
            <svg
                id="canvas"
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
            >
                <g
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px) scale(${zoom})`,
                        transformOrigin: 'top left',
                    }}
                >
                    {liveLayersId.map((layerId: any) => (
                        <LayerPreview
                            liveLayers={liveLayers}
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                        />
                    ))}
                    <SelectionBox
                        liveLayers={liveLayers}
                        selectedLayers={selectedLayers}
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                    />
                    {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
                        <rect
                            className="fill-blue-500/5 stroke-blue-500 stroke-1"
                            x={Math.min(canvasState.origin.x, canvasState.current.x)}
                            y={Math.min(canvasState.origin.y, canvasState.current.y)}
                            width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                            height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                        />
                    )}
                    {pencilDraft != null && pencilDraft.length > 0 && (
                        <Path
                            points={pencilDraft}
                            fill={colorToCss(lastUsedColor)}
                            x={0}
                            y={0}
                        />
                    )}
                </g>
            </svg>
        </main>
    );
};