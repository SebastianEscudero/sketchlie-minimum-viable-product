import React, { useEffect, useRef, useMemo } from 'react';
import { TextLayer } from "@/types/canvas";
import { cn, colorToCss } from "@/lib/utils";
import { Kalam } from "next/font/google";

const font = Kalam({
    subsets: ["latin"],
    weight: ["400"],
});

interface TextProps {
    id: string;
    layer: TextLayer;
    onPointerDown?: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
    setLiveLayers?: (layers: any) => void;
    onRefChange?: (ref: React.RefObject<any>) => void;
};

export const Text = ({
    layer,
    onPointerDown,
    id,
    selectionColor,
    setLiveLayers,
    onRefChange,
}: TextProps) => {
    const { x, y, width, height, fill, value, textFontSize } = layer;
    const textRef = useRef<any>(null);
    const storedLayers = localStorage.getItem('layers');
    const layers = useMemo(() => storedLayers ? JSON.parse(storedLayers) : {}, [storedLayers]);
    const fillColor = colorToCss(layer.fill);
    const isTransparent = fillColor === 'rgba(0,0,0,0)';

    const updateValue = (newValue: string) => {
        const storedLayers = localStorage.getItem('layers');
        const layers = storedLayers ? JSON.parse(storedLayers) : {};
        if (layers[id]) {
            layers[id].value = newValue;
            localStorage.setItem('layers', JSON.stringify(layers));
        }
        return layers;
    };

    const handleContentChange = (newValue: string) => {
        const newLayers = updateValue(newValue);
        textRef.current.style.height = textFontSize*1.5
        if (setLiveLayers) {
            newLayers[id].height = textRef.current?.scrollHeight || height;
            setLiveLayers(newLayers);
        }
    };

    useEffect(() => {
        if (onRefChange) {
            onRefChange(textRef);
        }
    }, [textRef, onRefChange]);

    useEffect(() => {
        if (textRef.current) {
            textRef.current.focus();
        }
    }, [textRef]);

    useEffect(() => {        
        textRef.current.style.height = `${textFontSize*1.5}px`;
        textRef.current.style.height = `${textRef.current.scrollHeight}px`;
    }, [width, value, id, height, layer, textFontSize]);

    if (!fill) {
        return null;
    }

    return (
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
                outline: selectionColor ? `1px solid ${selectionColor}` : "none",
            }}
            onPointerDown={onPointerDown ? (e) => onPointerDown(e, id) : undefined}
        >
            <textarea
                ref={textRef}
                value={value || ""}
                onChange={e => handleContentChange(e.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder='Type something...'
                className={cn(
                    "outline-none w-full h-full text-left flex px-0.5",
                    font.className
                )}
                style={{
                    color: isTransparent ? "#000" : fillColor,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-all',
                    display: 'flex',
                    backgroundColor: 'transparent',
                    resize: "none",
                    overflowY: "hidden",
                    overflowX: "hidden",
                    userSelect: "none",
                    fontSize: textFontSize,
                }}
            />
        </foreignObject>
    );
};