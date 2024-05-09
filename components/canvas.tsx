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

export const Canvas = () => {
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const [liveLayers, setLiveLayers] = useState<Layers>({});
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
    const [liveLayersId, setLiveLayersId] = useState<string[]>([]);
    const selectedLayersRef = useRef<string[]>([]);
    const [zoom, setZoom] = useState(localStorage.getItem("zoom") ? parseFloat(localStorage.getItem("zoom") || '1') : 1);
    const [copiedLayers, setCopiedLayers] = useState<Map<string, any>>(new Map());
    const [pencilDraft, setPencilDraft] = useState<number[][]>([[]]);
    const [textRef, setTextRef] = useState<any>(null);
    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });
    const [camera, setCamera] = useState<Camera>(localStorage.getItem("camera") ? JSON.parse(localStorage.getItem("camera") || '{"x":0,"y":0}') : { x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [rightClickPanning, setIsRightClickPanning] = useState(false);
    const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [currentPreviewLayer, setCurrentPreviewLayer] = useState<PreviewLayer | null>(null);
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

    const insertLayer = useCallback((layerType: LayerType, position: Point, width: number, height: number, center?: Point) => {
        const layerId = nanoid();

        let layer;
        let fillColor = { r: 0, g: 0, b: 0, a: 0 }
        if (layerType === LayerType.Note) {
            fillColor = { r: 255, g: 249, b: 177, a: 1 }
        }

        if (layerType === LayerType.Text) {

            if (width < 130) {
                width = 130;
            }

            layer = {
                type: layerType,
                x: position.x,
                y: position.y,
                height: height,
                width: width,
                fill: fillColor,
                textFontSize: 12,
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


        if (layer.type !== LayerType.Text) {
            selectedLayersRef.current = [layerId];
        }

        localStorage.setItem("layerIds", JSON.stringify(newLayerIds));
        localStorage.setItem("layers", JSON.stringify(newLayers));

        setCanvasState({ mode: CanvasMode.None });
    }, [liveLayers, liveLayersId]);

    const insertImage = useCallback((
        layerType: LayerType.Image,
        position: Point,
        selectedImage: string,
    ) => {
        const layerId = nanoid();


        if (selectedImage === "") {
            return;
        }

        const layer = {
            type: layerType,
            x: position.x,
            y: position.y,
            height: 80,
            width: 80,
            src: selectedImage,
            fill: null,
            value: "",
        };

        const newLayers = { ...liveLayers, [layerId]: layer };
        const newLayerIds = [...liveLayersId, layerId];
        setLiveLayersId(newLayerIds);
        setLiveLayers(newLayers as Layers);
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
                if (layer.type === LayerType.Arrow && 'center' in newLayer && newLayer.center) {
                    newLayer.center.x += offset.x;
                    newLayer.center.y += offset.y
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
        liveLayers[id] = penPointsToPathLayer(pencilDraft, { r: 0, g: 0, b: 0, a: 0 });

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

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length !== 2) return;
    
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
    
        const distance = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
        );
    
        if (initialPinchDistance === null) {
            setInitialPinchDistance(distance);
            return;
        }
    
        let newZoom = zoom;
        if (distance > initialPinchDistance) {
            newZoom = Math.min(zoom * 1.1, 3.5);
        } else {
            newZoom = Math.max(zoom / 1.1, 0.3);
        }
    
        const zoomFactor = newZoom / zoom;
        const newX = (touch1.clientX + touch2.clientX) / 2 - ((touch1.clientX + touch2.clientX) / 2 - camera.x) * zoomFactor;
        const newY = (touch1.clientY + touch2.clientY) / 2 - ((touch1.clientY + touch2.clientY) / 2 - camera.y) * zoomFactor;
    
        setZoom(newZoom);
        setCamera({ x: newX, y: newY });
        setInitialPinchDistance(distance);
    }, [zoom, camera, initialPinchDistance]);

    const onWheel = useCallback((e: React.WheelEvent) => {
        const svgRect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const y = e.clientY - svgRect.top;

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
    }, [zoom, camera]);

    const onPointerDown = useCallback((
        e: React.PointerEvent,
    ) => {
        const point = pointerEventToCanvasPoint(e, camera, zoom);

        if (e.button === 0) {
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
    }, [camera, canvasState.mode, setCanvasState, startDrawing, setIsPanning, setIsRightClickPanning, zoom]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
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
            setIsPanning(true);

            switch (canvasState.layerType) {
                case LayerType.Rectangle:
                    setCurrentPreviewLayer({ x, y, width, height, type: LayerType.Rectangle, fill: { r: 0, g: 0, b: 0, a: 0 }, outlineFill: { r: 1, g: 1, b: 1, a: 1 } });
                    break;
                case LayerType.Ellipse:
                    setCurrentPreviewLayer({ x, y, width, height, type: LayerType.Ellipse, fill: { r: 0, g: 0, b: 0, a: 0 }, outlineFill: { r: 1, g: 1, b: 1, a: 1 } });
                    break;
                case LayerType.Text:
                    setCurrentPreviewLayer({ x, y, width, height: 20, type: LayerType.Rectangle, fill: { r: 0, g: 0, b: 0, a: 0 }, outlineFill: null });
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
            document.body.style.cursor = "url(/custom-cursors/pencil.svg) 2 18, auto";
            insertPath();
        } else if (canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Image) {
            setSelectedImage("");
            insertImage(LayerType.Image, point, selectedImage);
        } else if (canvasState.mode === CanvasMode.Inserting && canvasState.layerType !== LayerType.Image) {
            const layerType = canvasState.layerType;
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
                    width = 130;
                    height = 37;
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
                setIsPanning(false);
            }
        } else if (canvasState.mode === CanvasMode.Moving) {
            document.body.style.cursor = 'url(/custom-cursors/hand.svg) 8 8, auto';
            setIsPanning(false);
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
            selectedImage,
            setSelectedImage,
            insertImage,
        ]);

    const onLayerPointerDown = useCallback((e: React.PointerEvent, layerId: string) => {

        if (
            canvasState.mode === CanvasMode.Pencil ||
            canvasState.mode === CanvasMode.Inserting
        ) {
            return;
        }

        e.stopPropagation();

        setCanvasState({ mode: CanvasMode.Translating, current: mousePositionRef.current });

        if (selectedLayersRef.current.includes(layerId)) {
            return;
        }

        selectedLayersRef.current = [layerId];

    }, [selectedLayersRef, canvasState]);

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
        setLiveLayers(newLiveLayers);
        setLiveLayersId(newLiveLayerIds);
        localStorage.setItem("layers", JSON.stringify(newLiveLayers));
        localStorage.setItem("layerIds", JSON.stringify(newLiveLayerIds));
    }, [copiedLayers]);

    useEffect(() => {
        const onMouseMove = (e: any) => {
            if (e.buttons === 0) {
                mousePositionRef.current = pointerEventToCanvasPoint(e, camera, zoom);
            }
        };

        document.addEventListener('mousemove', onMouseMove);

        function onKeyDown(e: KeyboardEvent) {
            switch (e.key.toLocaleLowerCase()) {
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
                        selectedLayersRef.current.forEach(id => {
                            delete newLayers[id];
                        });
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
        } else if (canvasState.mode === CanvasMode.Moving) {
            document.body.style.cursor = 'url(/custom-cursors/hand.svg) 8 8, auto';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [canvasState.mode, canvasState]);

    return (
        <main
            className="h-full w-full relative bg-neutral-100 touch-none overscroll-none" style={{ backgroundImage: "url(/dot-grid.png)", backgroundSize: 'cover' }}
        >
            <Info
                selectedLayers={selectedLayersRef.current}
                setLiveLayers={setLiveLayers}
                setLiveLayersId={setLiveLayersId}
            />
            <SketchlieBlock />
            <BottomCanvasLinks />
            <Toolbar
                onImageSelect={setSelectedImage}
                canvasState={canvasState}
                setCanvasState={setCanvasState}
            />
            {canvasState.mode === CanvasMode.None &&(
                <SelectionTools
                    setLiveLayerIds={setLiveLayersId}
                    setLiveLayers={setLiveLayers}
                    liveLayerIds={liveLayersId}
                    liveLayers={liveLayers}
                    selectedLayers={selectedLayersRef.current}
                    zoom={zoom}
                    camera={camera}
                />
            )}
            <svg
                id="canvas"
                className="h-[100vh] w-[100vw]"
                onTouchMove={onTouchMove}
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
                    <SelectionBox
                        zoom={zoom}
                        liveLayers={liveLayers}
                        selectedLayers={selectedLayersRef.current}
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                        onArrowResizeHandlePointerDown={onArrowResizeHandlePointerDown}
                    />
                    {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
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
                    {pencilDraft != null && pencilDraft.length > 0 && (
                        <Path
                            points={pencilDraft}
                            fill={colorToCss({r: 0 ,g: 0, b: 0, a: 0,})}
                            x={0}
                            y={0}
                        />
                    )}
                </g>
            </svg>
        </main>
    );
};