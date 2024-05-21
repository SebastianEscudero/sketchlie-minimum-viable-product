"use client";

import { nanoid } from "nanoid";
import { useCallback, useState, useEffect, useRef } from "react";
import {
    colorToCss,
    findIntersectingLayersWithRectangle,
    penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeArrowBounds,
    resizeBounds,
} from "@/lib/utils";
import {
    ArrowHandle,
    ArrowHead,
    Camera,
    CanvasMode,
    CanvasState,
    Layers,
    LayerType,
    Point,
    PreviewLayer,
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
import { CurrentPreviewLayer } from "./current-preview-layer";

interface Command {
    execute(): void;
    undo(): void;
}

class InsertLayerCommand implements Command {
    constructor(private layerIds: any[],
        private layers: any[],
        private prevLayers: Layers,
        private prevLayerIds: string[], 
        private setLiveLayers: (layers: Layers) => void,
        private setLiveLayerIds: (layerIds: string[]) => void) {}
    execute() {
      let newLayers = { ...this.prevLayers };
      let newLayerIds = [...this.prevLayerIds];

      this.layerIds.forEach((layerId, index) => {
        newLayers = { ...newLayers, [layerId]: this.layers[index] };
        newLayerIds = [...newLayerIds, layerId];
      });

      this.setLiveLayers(newLayers);
      this.setLiveLayerIds(newLayerIds);

      // Call the addLayer API mutation to add the layers in the database
      localStorage.setItem("layers", JSON.stringify(newLayers));
    }

    undo() {
      let remainingLayers = { ...this.prevLayers };
      let remainingLayerIds = [...this.prevLayerIds];

      this.layerIds.forEach((layerId) => {
        const { [layerId]: _, ...remaining } = remainingLayers;
        remainingLayers = remaining;
        remainingLayerIds = remainingLayerIds.filter(id => id !== layerId);
      });

      this.setLiveLayers(remainingLayers);
      this.setLiveLayerIds(remainingLayerIds);

      // Call the deleteLayer API mutation to delete the layers in the database
      localStorage.setItem("layers", JSON.stringify(remainingLayers));
    }
}

class DeleteLayerCommand implements Command {
    constructor(private layerIds: string[],
        private layers: any,
        private prevLayers: Layers,
        private prevLayerIds: string[], 
        private setLiveLayers: (layers: Layers) => void,
        private setLiveLayerIds: (layerIds: string[]) => void) {}

        execute() {
            const remainingLayers = { ...this.prevLayers };
            const remainingLayerIds = [...this.prevLayerIds];

            this.layerIds.forEach(id => {
                delete remainingLayers[id];
                const index = remainingLayerIds.indexOf(id);
                if (index > -1) {
                    remainingLayerIds.splice(index, 1);
                }
            });

            // Call the deleteLayer API mutation to delete all the layers in the database
            this.setLiveLayers(remainingLayers);
            this.setLiveLayerIds(remainingLayerIds);

            localStorage.setItem("layers", JSON.stringify(remainingLayers));
            localStorage.setItem("layerIds", JSON.stringify(remainingLayerIds));
        }

        undo() {
            const newLayers = { ...this.prevLayers };
            const newLayerIds = [...this.prevLayerIds];

            const layersToAdd = this.layerIds.map(id => {
                newLayers[id] = this.layers[id];
                if (!newLayerIds.includes(id)) {
                    newLayerIds.push(id);
                }
                return this.layers[id];
            });

            // Call the addLayer API mutation to add all the layers back in the database
            this.setLiveLayers(newLayers);
            this.setLiveLayerIds(newLayerIds);

            localStorage.setItem("layers", JSON.stringify(layersToAdd));
            localStorage.setItem("layerIds", JSON.stringify(newLayerIds));
        }
}

class TranslateLayersCommand implements Command {
    constructor(
        private layerIds: string[],
        private initialLayers: any,
        private finalLayers: any,
        private setLiveLayers: (layers: any) => void,) {}

    execute() {
        this.setLiveLayers({ ...this.finalLayers });

        // Prepare layer updates
        const layerUpdates = this.layerIds.map(layerId => this.finalLayers[layerId]);

        // Call the updateLayer API mutation to update the layers in the database
        localStorage.setItem("layers", JSON.stringify(this.finalLayers));
    }

    undo() {
        this.setLiveLayers({ ...this.initialLayers });

        // Prepare layer updates
        const layerUpdates = this.layerIds.map(layerId => this.initialLayers[layerId]);

        // Call the updateLayer API mutation to revert the layers in the database
        localStorage.setItem("layers", JSON.stringify(this.initialLayers));
    }
}


export const Canvas = () => {
    const [initialLayers, setInitialLayers] = useState<Layers>({}); // used for undo/redo
    const [history, setHistory] = useState<Command[]>([]);
    const [redoStack, setRedoStack] = useState<Command[]>([]);
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const [liveLayers, setLiveLayers] = useState<Layers>({});
    const [liveLayersId, setLiveLayersId] = useState<string[]>([]);
    const selectedLayersRef = useRef<string[]>([]);
    const [zoom, setZoom] = useState(localStorage.getItem("zoom") ? parseFloat(localStorage.getItem("zoom") || '1') : 1);
    const [camera, setCamera] = useState<Camera>(localStorage.getItem("camera") ? JSON.parse(localStorage.getItem("camera") || '{"x":0,"y":0}') : { x: 0, y: 0 });
    const zoomRef = useRef(zoom);
    const cameraRef = useRef(camera);
    const [copiedLayers, setCopiedLayers] = useState<Map<string, any>>(new Map());
    const [pencilDraft, setPencilDraft] = useState<number[][]>([[]]);
    const [textRef, setTextRef] = useState<any>(null);
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });
    const canvasStateRef = useRef(canvasState);
    const [isPanning, setIsPanning] = useState(false);
    const [pinchStartDist, setPinchStartDist] = useState<number | null>(null);
    const [rightClickPanning, setIsRightClickPanning] = useState(false);
    const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [currentPreviewLayer, setCurrentPreviewLayer] = useState<PreviewLayer | null>(null);
    const [activeTouches, setActiveTouches] = useState(0);
    const [pathColor, setPathColor] = useState({ r: 1, g: 1, b: 1, a: 1 });
    const [pathStrokeSize, setPathStrokeSize] = useState(4);

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

    const performAction = (command: Command) => {
        command.execute();
        setHistory([...history, command]);
        setRedoStack([]); // clear redo stack when new action is performed
    };

    const undo = () => {
        const lastCommand = history[history.length - 1];
        lastCommand.undo();
        setHistory(history.slice(0, -1));
        setRedoStack([...redoStack, lastCommand]);
    };

    const redo = () => {
        const lastCommand = redoStack[redoStack.length - 1];
        lastCommand.execute();
        setRedoStack(redoStack.slice(0, -1));
        setHistory([...history, lastCommand]);
    };

    const insertLayer = useCallback((layerType: LayerType, position: Point, width: number, height: number, center?: Point) => {
        const layerId = nanoid();

        let layer;
        let fillColor = { r: 0, g: 0, b: 0, a: 0 }
        if (layerType === LayerType.Note) {
            fillColor = { r: 255, g: 249, b: 177, a: 1 }
        }

        if (layerType === LayerType.Text) {

            if (width < 95) {
                width = 95;
            }

            layer = {
                type: layerType,
                x: position.x,
                y: position.y,
                height: height,
                width: width,
                fill: fillColor,
                textFontSize: 12,
                outlineFill: null
            };
        } else if (layerType === LayerType.Note) {
            layer = {
                type: layerType,
                x: position.x,
                y: position.y,
                height: height,
                width: width,
                fill: fillColor,
                outlineFill: { r: 0, g: 0, b: 0, a: 0 },
                textFontSize: 12,
            };
        } else if (layerType === LayerType.Arrow) {
            layer = {
                type: layerType,
                x: position.x,
                y: position.y,
                center: center,
                height: height,
                width: width,
                fill: fillColor,
                startArrowHead: ArrowHead.None,
                endArrowHead: ArrowHead.Triangle,
            };
        } else {
            layer = {
                type: layerType,
                x: position.x,
                y: position.y,
                height: height,
                width: width,
                fill: fillColor,
                outlineFill: { r: 1, g: 1, b: 1, a: 1 },
            };
        }

        const newLayers = { ...liveLayers, [layerId]: layer };
        const newLayerIds = [...liveLayersId, layerId];

        setLiveLayersId(newLayerIds);
        setLiveLayers(newLayers as Layers);

        const command = new InsertLayerCommand([layerId], [layer], liveLayers, liveLayersId, setLiveLayers, setLiveLayersId);
        performAction(command);

        if (layer.type !== LayerType.Text) {
            selectedLayersRef.current = [layerId];
        }

        localStorage.setItem("layerIds", JSON.stringify(newLayerIds));
        localStorage.setItem("layers", JSON.stringify(newLayers));

        setCanvasState({ mode: CanvasMode.None });
    }, [liveLayers, liveLayersId]);

    const translateSelectedLayers = useCallback((point: Point) => {
        if (canvasState.mode !== CanvasMode.Translating) {
            return;
        }

        const offset = {
            x: (point.x - canvasState.current.x),
            y: (point.y - canvasState.current.y)
        };

        const newLayers = { ...liveLayers };

        selectedLayersRef.current.forEach(id => {
            const layer = newLayers[id];

            if (layer) {
                const newLayer = { ...layer };
                newLayer.x += offset.x;
                newLayer.y += offset.y;
                if (newLayer.type === LayerType.Arrow && newLayer.center) {
                    const newCenter = {
                        x: newLayer.center.x + offset.x,
                        y: newLayer.center.y + offset.y
                    };
                    newLayer.center = newCenter;
                }
                newLayers[id] = newLayer;
            }
        });

        setLiveLayers(newLayers);
        localStorage.setItem("layers", JSON.stringify(newLayers));
        setCanvasState({ mode: CanvasMode.Translating, current: point });
    }, [canvasState, liveLayers, selectedLayersRef]);

    const unselectLayers = useCallback(() => {
        if (selectedLayersRef.current.length > 0) {
            selectedLayersRef.current = ([]);
        }
    }, [selectedLayersRef]);

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

        selectedLayersRef.current = ids;

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
        liveLayers[id] = penPointsToPathLayer(pencilDraft, pathColor, pathStrokeSize);

        const liveLayerIds = JSON.parse(localStorage.getItem("layerIds") || '[]');
        liveLayerIds.push(id);

        setPencilDraft([[]]);
        setLiveLayers({ ...liveLayers });
        setLiveLayersId([...liveLayerIds]);
        localStorage.setItem("layers", JSON.stringify(liveLayers));
        localStorage.setItem("layerIds", JSON.stringify(liveLayerIds));

        setCanvasState({ mode: CanvasMode.Pencil });
    }, [pencilDraft, liveLayers]);

    const startDrawing = useCallback((point: Point, pressure: number) => {
        const pencilDraft = [[point.x, point.y, pressure]];
        setPencilDraft(pencilDraft);
        localStorage.setItem("pencilDraft", JSON.stringify(pencilDraft));
    }, []);

    const resizeSelectedLayer = useCallback((point: Point) => {
        const layer = liveLayers[selectedLayersRef.current[0]];
        let bounds

        if (canvasState.mode === CanvasMode.Resizing) {
            if (layer.type === LayerType.Text) {
                bounds = resizeBounds(
                    layer?.type,
                    canvasState.initialBounds,
                    canvasState.corner,
                    point,
                    textRef,
                    layer,
                );
            } else {
                bounds = resizeBounds(
                    layer?.type,
                    canvasState.initialBounds,
                    canvasState.corner,
                    point,
                );
            }
        } else if (canvasState.mode === CanvasMode.ArrowResizeHandler) {
            bounds = resizeArrowBounds(
                canvasState.initialBounds,
                point,
                canvasState.handle,
            );
        } else {
            return;
        }

        if (layer) {
            if (layer.type === LayerType.Note) {
                bounds.textFontSize = layer.textFontSize;
            }
            Object.assign(layer, bounds);
            liveLayers[selectedLayersRef.current[0]] = layer;
            setLiveLayers({ ...liveLayers });
            localStorage.setItem("layers", JSON.stringify(liveLayers));
        }
    }, [canvasState, liveLayers, selectedLayersRef, textRef]);

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

    const onArrowResizeHandlePointerDown = useCallback((
        handle: ArrowHandle,
        initialBounds: XYWH,
    ) => {
        setCanvasState({
            mode: CanvasMode.ArrowResizeHandler,
            initialBounds,
            handle,
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

        const isMouseWheel = Math.abs(e.deltaY) % 100 === 0 && e.deltaX === 0;

        if (isMouseWheel || e.ctrlKey) {
            // Zooming
            let newZoom = zoom;
            if (e.deltaY < 0) {
                newZoom = Math.min(zoom * 1.1, 3.5);
            } else {
                newZoom = Math.max(zoom / 1.1, 0.3);
            }

            const zoomFactor = newZoom / zoom;
            const newX = x - (x - camera.x) * zoomFactor;
            const newY = y - (y - camera.y) * zoomFactor;

            setZoom(newZoom);
            localStorage.setItem("zoom", newZoom.toString());
            setCamera({ x: newX, y: newY });
            localStorage.setItem("camera", JSON.stringify({ x: newX, y: newY }));
        } else {
            // Panning
            const newCameraPosition = {
                x: camera.x - e.deltaX,
                y: camera.y - e.deltaY,
            };

            setCamera(newCameraPosition);
            localStorage.setItem("camera", JSON.stringify(newCameraPosition));
        }
    }, [zoom, camera]);

    const onPointerDown = useCallback((
        e: React.PointerEvent,
    ) => {

        if (activeTouches > 1) {
            return;
        }

        const point = pointerEventToCanvasPoint(e, camera, zoom);

        if (e.button === 0) {
            if (canvasState.mode === CanvasMode.Eraser) {
                return;
            }
            if (canvasState.mode === CanvasMode.Moving) {
                setIsPanning(true);
                setStartPanPoint({ x: e.clientX, y: e.clientY });
                document.body.style.cursor = 'url(/custom-cursors/grab.svg) 8 8, auto';
                return;
            }

            if (canvasState.mode === CanvasMode.Inserting) {
                const point = pointerEventToCanvasPoint(e, camera, zoom);
                if (e.button === 0 && canvasState.mode === CanvasMode.Inserting) {
                    setStartPanPoint(point);
                    setIsPanning(false);
                    return;
                }
            }

            if (canvasState.mode === CanvasMode.Pencil) {
                startDrawing(point, e.pressure);
                return;
            }

            setCanvasState({ origin: point, mode: CanvasMode.Pressing });
        } else if (e.button === 2 || e.button === 1) {
            setIsRightClickPanning(true);
            setStartPanPoint({ x: e.clientX, y: e.clientY });
            document.body.style.cursor = 'url(/custom-cursors/grab.svg) 8 8, auto';
        }
    }, [camera, canvasState.mode, setCanvasState, startDrawing, setIsPanning, setIsRightClickPanning, zoom, activeTouches]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        e.preventDefault();

        if (activeTouches > 1) {
            return;
        }

        if (rightClickPanning) {
            const newCameraPosition = {
                x: camera.x + e.clientX - startPanPoint.x,
                y: camera.y + e.clientY - startPanPoint.y,
            };
            setCamera(newCameraPosition);
            localStorage.setItem("camera", JSON.stringify(newCameraPosition));
            setStartPanPoint({ x: e.clientX, y: e.clientY });
        }

        if (canvasState.mode === CanvasMode.Moving && isPanning) {
            const newCameraPosition = {
                x: camera.x + e.clientX - startPanPoint.x,
                y: camera.y + e.clientY - startPanPoint.y,
            };
            setCamera(newCameraPosition);
            localStorage.setItem("camera", JSON.stringify(newCameraPosition));
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
        } else if (canvasState.mode === CanvasMode.ArrowResizeHandler) {
            resizeSelectedLayer(current);
        } else if (canvasState.mode === CanvasMode.Pencil) {
            continueDrawing(current, e);
        } else if (
            e.buttons === 1 &&
            canvasState.mode === CanvasMode.Inserting &&
            startPanPoint &&
            canvasState.layerType !== LayerType.Path &&
            canvasState.layerType !== LayerType.Image &&
            (startPanPoint.x !== 0 || startPanPoint.y !== 0)
        ) {
            const point = pointerEventToCanvasPoint(e, camera, zoom);
            const widthArrow = point.x - startPanPoint.x;
            const heightArrow = point.y - startPanPoint.y;
            const x = Math.min(point.x, startPanPoint.x);
            const y = Math.min(point.y, startPanPoint.y);
            const width = Math.abs(point.x - startPanPoint.x);
            const height = Math.abs(point.y - startPanPoint.y);

            if (height < 10 || width < 10) {
                return;
            }

            setIsPanning(true);

            switch (canvasState.layerType) {
                case LayerType.Rectangle:
                    setCurrentPreviewLayer({ x, y, width, height, type: LayerType.Rectangle, fill: { r: 0, g: 0, b: 0, a: 0 }, outlineFill: { r: 1, g: 1, b: 1, a: 1 } });
                    break;
                case LayerType.Ellipse:
                    setCurrentPreviewLayer({ x, y, width, height, type: LayerType.Ellipse, fill: { r: 0, g: 0, b: 0, a: 0 }, outlineFill: { r: 1, g: 1, b: 1, a: 1 } });
                    break;
                case LayerType.Text:
                    setCurrentPreviewLayer({ x, y, width, height: 18, type: LayerType.Rectangle, fill: { r: 0, g: 0, b: 0, a: 0 }, outlineFill: { r: 39, g: 142, b: 237, a: 1 } })
                    break;
                case LayerType.Note:
                    setCurrentPreviewLayer({ x, y, width, height, textFontSize: 12, type: LayerType.Note, fill: { r: 255, g: 249, b: 177, a: 1 }, outlineFill: { r: 0, g: 0, b: 0, a: 0 } });
                    break;
                case LayerType.Arrow:
                    setCurrentPreviewLayer({
                        x: startPanPoint.x,
                        y: startPanPoint.y,
                        center: { x: startPanPoint.x + widthArrow / 2, y: startPanPoint.y + heightArrow / 2 },
                        width: widthArrow,
                        height: heightArrow,
                        type: LayerType.Arrow,
                        fill: { r: 0, g: 0, b: 0, a: 0 },
                        startArrowHead: ArrowHead.None,
                        endArrowHead: ArrowHead.Triangle
                    });
            }
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
            startPanPoint,
            activeTouches
        ]);

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        setIsRightClickPanning(false);
        const point = pointerEventToCanvasPoint(e, camera, zoom);
        if (
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Pressing
        ) {
            document.body.style.cursor = 'default';
            unselectLayers();
            setCanvasState({
                mode: CanvasMode.None,
            });
        } else if (canvasState.mode === CanvasMode.Pencil) {
            document.body.style.cursor = 'url(/custom-cursors/pencil.svg) 8 8, auto';
            insertPath();
        } else if (canvasState.mode === CanvasMode.Eraser) {
            document.body.style.cursor = 'url(/custom-cursors/eraser.svg) 8 8, auto';
            return;
        } else if (canvasState.mode === CanvasMode.Inserting && canvasState.layerType !== LayerType.Image) {
            const layerType = canvasState.layerType;
            setIsPanning(false);
            if (isPanning && currentPreviewLayer) {
                if (layerType === LayerType.Arrow && currentPreviewLayer.type === LayerType.Arrow) {
                    insertLayer(layerType, { x: currentPreviewLayer.x, y: currentPreviewLayer.y }, currentPreviewLayer.width, currentPreviewLayer.height, currentPreviewLayer.center)
                    setCurrentPreviewLayer(null);
                } else {
                    insertLayer(layerType, { x: currentPreviewLayer.x, y: currentPreviewLayer.y }, currentPreviewLayer.width, currentPreviewLayer.height);
                    setCurrentPreviewLayer(null);
                }
            } else if (layerType !== LayerType.Arrow) {
                let width
                let height
                if (layerType === LayerType.Text) {
                    width = 95;
                    height = 18;
                    point.x = point.x - width / 2
                    point.y = point.y - height / 2
                    insertLayer(layerType, point, width, height)
                } else {
                    width = 80;
                    height = 80;
                    point.x = point.x - width / 2
                    point.y = point.y - height / 2
                    insertLayer(layerType, point, width, height);
                }
            }
        } else if (canvasState.mode === CanvasMode.Moving) {
            document.body.style.cursor = 'url(/custom-cursors/hand.svg) 8 8, auto';
            setIsPanning(false);
        } else if (canvasState.mode === CanvasMode.Translating) {
            let layerIds: any = [];
            let layerUpdates: any = [];        
            selectedLayersRef.current.forEach(id => {
                const newLayer = liveLayers[id];
                if (newLayer) {
                    layerIds.push(id);
                    layerUpdates.push(newLayer);
                }
            });
        
            if (layerIds.length > 0) {
                const command = new TranslateLayersCommand(layerIds, initialLayers, liveLayers, setLiveLayers);
                performAction(command);
            }
            setCanvasState({
                mode: CanvasMode.None,
            });
        } else if (canvasState.mode === CanvasMode.Resizing || canvasState.mode === CanvasMode.ArrowResizeHandler) {
            let layerIds: any = [];
            let layerUpdates: any = [];

            selectedLayersRef.current.forEach(id => {
                const newLayer = liveLayers[id];
                if (newLayer) {
                    layerIds.push(id);
                    layerUpdates.push(newLayer);
                }
            });

            if (layerIds.length > 0) {
                const command = new TranslateLayersCommand(layerIds, initialLayers, liveLayers, setLiveLayers);
                performAction(command);
            }
            setCanvasState({
                mode: CanvasMode.None,
            });
        } else {
            document.body.style.cursor = 'default';
            setCanvasState({
                mode: CanvasMode.None,
            });
        }

    },
        [
            isPanning,
            currentPreviewLayer,
            setCanvasState,
            camera,
            canvasState,
            insertLayer,
            unselectLayers,
            insertPath,
            setIsPanning,
            zoom,
            initialLayers,
            liveLayers,
            selectedLayersRef,
        ]);

    const onPathErase = useCallback((e: React.PointerEvent, layerId: string) => {
        if (canvasState.mode === CanvasMode.Eraser && e.buttons === 1) {
            const newLiveLayers = { ...liveLayers };
            delete newLiveLayers[layerId];
            localStorage.setItem("layers", JSON.stringify(newLiveLayers));
            localStorage.setItem("layerIds", JSON.stringify(liveLayersId.filter(id => id !== layerId)));
            setLiveLayers(newLiveLayers);
            setLiveLayersId(liveLayersId.filter(id => id !== layerId));
        }
    }, [canvasState.mode, liveLayers, liveLayersId, setLiveLayers]);

    const onLayerPointerDown = useCallback((e: React.PointerEvent, layerId: string) => {
        if (
            canvasStateRef.current.mode === CanvasMode.Pencil ||
            canvasStateRef.current.mode === CanvasMode.Inserting ||
            canvasStateRef.current.mode === CanvasMode.Moving ||
            canvasStateRef.current.mode === CanvasMode.Eraser ||
            e.button !== 0
        ) {
            return;
        }

        e.stopPropagation();

        const point = pointerEventToCanvasPoint(e, cameraRef.current, zoomRef.current);
        setCanvasState({ mode: CanvasMode.Translating, current: point });

        if (selectedLayersRef.current.includes(layerId)) {
            return;
        }

        selectedLayersRef.current = [layerId];

    }, [selectedLayersRef]);

    const onTouchDown = useCallback((e: React.TouchEvent) => {
        setActiveTouches(e.touches.length);
    }, []);

    const onTouchUp = useCallback((e: React.TouchEvent) => {
        setActiveTouches(e.changedTouches.length);
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        setActiveTouches(e.touches.length);

        if (e.touches.length < 2) {
            setPinchStartDist(null);
            return;
        }

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const dist = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
        );

        const svgRect = e.currentTarget.getBoundingClientRect();
        const x = ((touch1.clientX + touch2.clientX) / 2) - svgRect.left;
        const y = ((touch1.clientY + touch2.clientY) / 2) - svgRect.top;

        if (pinchStartDist === null) {
            setPinchStartDist(dist);
            setStartPanPoint({ x, y });
            return;
        }

        const distChange = Math.abs(dist - pinchStartDist);

        if (distChange > 10) { // Zooming
            let newZoom = zoom;
            if (dist > pinchStartDist) {
                newZoom = Math.min(zoom * 1.1, 3.5);
            } else {
                newZoom = Math.max(zoom / 1.1, 0.3);
            }

            const zoomFactor = newZoom / zoom;
            const newX = x - (x - camera.x) * zoomFactor;
            const newY = y - (y - camera.y) * zoomFactor;

            setZoom(newZoom);
            localStorage.setItem("zoom", newZoom.toString());
            setCamera({ x: newX, y: newY });
            localStorage.setItem("camera", JSON.stringify({ x: newX, y: newY }));
        } else if (startPanPoint) { // Panning
            const dx = x - startPanPoint.x;
            const dy = y - startPanPoint.y;

            const newCameraPosition = {
                x: camera.x + dx,
                y: camera.y + dy,
            };

            setCamera(newCameraPosition);
            localStorage.setItem("camera", JSON.stringify(newCameraPosition));
        }

        setPinchStartDist(dist);
        setStartPanPoint({ x, y });
    }, [zoom, pinchStartDist, camera, startPanPoint]);

    const copySelectedLayers = useCallback(() => {
        const copied = new Map();
        for (const id of selectedLayersRef.current) {
            const layer = liveLayers[id];
            if (layer) {
                const copiedLayer = JSON.parse(JSON.stringify(layer));
                copied.set(id, copiedLayer);
            }
        }
        setCopiedLayers(copied);
    }, [liveLayers, selectedLayersRef]);

    const pasteCopiedLayers = useCallback((mousePosition: any) => {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        copiedLayers.forEach((layer) => {
            minX = Math.min(minX, layer.x);
            minY = Math.min(minY, layer.y);
            maxX = Math.max(maxX, layer.x + layer.width);
            maxY = Math.max(maxY, layer.y + layer.height);
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const offsetX = mousePosition.x - centerX;
        const offsetY = mousePosition.y - centerY;

        const localStorageLiveLayers = JSON.parse(localStorage.getItem("layers") || '{}');
        const localStorageLiveLayersIds = JSON.parse(localStorage.getItem("layerIds") || '{}');

        const newSelection = [];
        const newLiveLayers = { ...localStorageLiveLayers };
        const newLiveLayerIds = [...localStorageLiveLayersIds];
        copiedLayers.forEach((layer) => {
            const newId = nanoid();
            newSelection.push(newId);
            newLiveLayerIds.push(newId);
            const clonedLayer = JSON.parse(JSON.stringify(layer));
            clonedLayer.x = clonedLayer.x + offsetX;
            clonedLayer.y = clonedLayer.y + offsetY;
            if (clonedLayer.type === LayerType.Arrow) {
                clonedLayer.center.x += offsetX;
                clonedLayer.center.y += offsetY;
            }
            newLiveLayers[newId] = clonedLayer;
        });
        
        const command = new InsertLayerCommand(newLiveLayerIds, newLiveLayerIds, liveLayers, liveLayersId, setLiveLayers, setLiveLayersId);
        performAction(command);

        setLiveLayers(newLiveLayers);
        setLiveLayersId(newLiveLayerIds);
        localStorage.setItem("layers", JSON.stringify(newLiveLayers));
        localStorage.setItem("layerIds", JSON.stringify(newLiveLayerIds));
    }, [copiedLayers]);

    useEffect(() => { // this is for the undo redo
        const onPointerDown = (e: PointerEvent) => {
            setInitialLayers({ ...liveLayers });
        }

        document.addEventListener('pointerdown', onPointerDown);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
        }
    }, [liveLayers])

    useEffect(() => {
        const onMouseMove = (e: any) => {
            if (e.buttons === 0) {
                mousePositionRef.current = pointerEventToCanvasPoint(e, camera, zoom);
            }
        };

        document.addEventListener('mousemove', onMouseMove);

        function onKeyDown(e: KeyboardEvent) {
            switch (e.key.toLocaleLowerCase()) {
                case "z": {
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey && redoStack.length > 0) {
                            redo();
                            return;
                        } else if (!e.shiftKey && history.length > 0) {
                            undo();
                            return;
                        }
                        e.preventDefault();
                    }
                    break;
                }
                case "c": {
                    if (e.ctrlKey || e.metaKey) {
                        copySelectedLayers();
                    }
                    break;
                }
                case "v": {
                    if (document.activeElement instanceof HTMLTextAreaElement) {
                        break;
                    }
                    if (e.ctrlKey || e.metaKey) {
                        if (copiedLayers.size > 0) {
                            e.preventDefault();
                            pasteCopiedLayers(mousePositionRef.current);
                        }
                    }
                    break;
                }
                case "backspace":
                    if (
                        document.activeElement instanceof HTMLTextAreaElement ||
                        document.activeElement instanceof HTMLInputElement ||
                        (document.activeElement instanceof HTMLElement && document.activeElement.contentEditable === "true")
                    ) {
                        break;
                    }
                    if (selectedLayersRef.current.length > 0) {
                        const newLayers = { ...liveLayers };
                        const deletedLayers: { [key: string]: any } = {};
                        selectedLayersRef.current.forEach(id => {
                            deletedLayers[id] = newLayers[id];
                            delete newLayers[id];
                        });

                        const command = new DeleteLayerCommand(selectedLayersRef.current, deletedLayers, liveLayers, liveLayersId, setLiveLayers, setLiveLayersId);
                        performAction(command);
                        setLiveLayers(newLayers);
                        setLiveLayersId(liveLayersId.filter(id => !selectedLayersRef.current.includes(id)));
                        localStorage.setItem("layerIds", JSON.stringify(liveLayersId));
                        localStorage.setItem("layers", JSON.stringify(newLayers));
                        selectedLayersRef.current = ([]);
                    }
            }
        }

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener('mousemove', onMouseMove);
        }
    }, [copySelectedLayers, pasteCopiedLayers, camera, zoom, liveLayers, selectedLayersRef, copiedLayers, liveLayersId]);


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
        if (canvasState.mode === CanvasMode.Inserting) {
            if (canvasState.layerType === LayerType.Text) {
                document.body.style.cursor = 'url(/custom-cursors/text-cursor.svg) 8 8, auto';
            } else {
                document.body.style.cursor = 'url(/custom-cursors/inserting.svg) 12 12, auto';
            }
        } else if (canvasState.mode === CanvasMode.Pencil) {
            document.body.style.cursor = 'url(/custom-cursors/pencil.svg) 2 18, auto';
        } else if (canvasState.mode === CanvasMode.Eraser) {
            document.body.style.cursor = 'url(/custom-cursors/eraser.svg) 8 8, auto';
        } else if (canvasState.mode === CanvasMode.Moving) {
            document.body.style.cursor = 'url(/custom-cursors/hand.svg) 8 8, auto';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [canvasState.mode, canvasState]);

    useEffect(() => { // for on layer pointer down to update refts
        canvasStateRef.current = canvasState;
        zoomRef.current = zoom;
        cameraRef.current = camera;
    }, [canvasState, zoom, camera]);

    console.log(liveLayersId)

    return (
        <main className="fixed h-full w-full bg-neutral-100 touch-none overscroll-none"
            style={{
                backgroundImage: "url(/dot-grid.png)",
                backgroundSize: 'cover',
                WebkitOverflowScrolling: 'touch',
                WebkitUserSelect: 'none',
            }}>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            <Info
                setLiveLayers={setLiveLayers}
                setLiveLayersId={setLiveLayersId}
            />
            <SketchlieBlock />
            <BottomCanvasLinks />
            <Toolbar
                pathStrokeSize={pathStrokeSize}
                setPathColor={setPathColor}
                setPathStrokeSize={setPathStrokeSize}
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                undo={undo}
                redo={redo}
                canUndo={history.length > 0}
                canRedo={redoStack.length > 0}
            />
            {canvasState.mode === CanvasMode.None && (
                <SelectionTools
                    setLiveLayerIds={setLiveLayersId}
                    setLiveLayers={setLiveLayers}
                    liveLayerIds={liveLayersId}
                    liveLayers={liveLayers}
                    selectedLayers={selectedLayersRef.current}
                    zoom={zoom}
                    camera={camera}
                    DeleteLayerCommand={DeleteLayerCommand}
                    performAction={performAction}
                />
            )}
            <svg
                id="canvas"
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onTouchStart={onTouchDown}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchUp}
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
                            onPathErase={onPathErase}
                            setLiveLayers={setLiveLayers}
                            liveLayers={liveLayers}
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            onRefChange={setTextRef}
                        />
                    ))}
                    {currentPreviewLayer && (
                        <CurrentPreviewLayer
                            layer={currentPreviewLayer}
                        />
                    )}
                    {(canvasState.mode === CanvasMode.SelectionNet || canvasState.mode === CanvasMode.None || CanvasMode.Resizing) && (
                        <SelectionBox
                            zoom={zoom}
                            liveLayers={liveLayers}
                            selectedLayers={selectedLayersRef.current}
                            onResizeHandlePointerDown={onResizeHandlePointerDown}
                            onArrowResizeHandlePointerDown={onArrowResizeHandlePointerDown}
                        />
                    )}
                    {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && activeTouches < 2 && (
                        <rect
                            style={{
                                fill: 'rgba(59, 130, 246, 0.3)',
                                stroke: '#3B82F6',
                                strokeWidth: 0.5
                            }}
                            x={Math.min(canvasState.origin.x, canvasState.current.x)}
                            y={Math.min(canvasState.origin.y, canvasState.current.y)}
                            width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                            height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                        />
                    )}
                    {pencilDraft != null && pencilDraft.length > 0 && pencilDraft[0].length > 0 && !pencilDraft.some(array => array.some(isNaN)) && (
                        <Path
                            points={pencilDraft}
                            fill={colorToCss(pathColor)}
                            x={0}
                            y={0}
                            strokeSize={pathStrokeSize}
                        />
                    )}
                </g>
            </svg>
        </main>
    );
};