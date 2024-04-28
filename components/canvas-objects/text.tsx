import React, { useState, useEffect, useRef } from 'react';
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
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
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
    setLiveLayers: (layers: any) => void;
};

export const Text = ({
    layer,
    onPointerDown,
    id,
    selectionColor,
    setLiveLayers,
}: TextProps) => {
    const { x, y, width, height, fill, value, textFontSize } = layer;
    const initialFontsize = textFontSize
    const [prevWidth, setPrevWidth] = useState(width);
    const [prevHeight, setPrevHeight] = useState(height);
    const [fontSize, setFontSize] = useState(initialFontsize);
    const textRef = useRef<any>(null);
    const storedLayers = localStorage.getItem('layers');
    const layers = storedLayers ? JSON.parse(storedLayers) : {};

    const updateValue = (newValue: string) => {
        const storedLayers = localStorage.getItem('layers');
        const layers = storedLayers ? JSON.parse(storedLayers) : {};
        if (layers[id]) {
            layers[id].value = newValue;
            layers[id].textFontSize = fontSize;
            localStorage.setItem('layers', JSON.stringify(layers));
        }
        return layers;
    };

    const handleContentChange = (e: ContentEditableEvent) => {
        const newLayers = updateValue(e.target.value);
        setLiveLayers(newLayers);
    };

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const selection = document.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const br = document.createElement('br');
                range.insertNode(br);
                range.setStartAfter(br);
                range.setEndAfter(br);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    const handlePaste = async (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = await navigator.clipboard.readText();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    };

    useEffect(() => {
        if (width !== prevWidth && height !== prevHeight) {
            const widthScaleFactor = width / prevWidth;
            const heightScaleFactor = height / prevHeight;
            const newFontSize = fontSize * Math.min(widthScaleFactor, heightScaleFactor);
            setFontSize(newFontSize);
            if (layers[id]) {
                layers[id].textFontSize = newFontSize;
                localStorage.setItem('layers', JSON.stringify(layers));
            }
            setLiveLayers(layers);
            console.log(localStorage.getItem('layers'));
        }
    }, [width, height, prevWidth, prevHeight]);
    
    useEffect(() => {
        setPrevWidth(width);
        setPrevHeight(height);
    }, [width, height]);
    
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
            onPointerDown={(e) => onPointerDown(e, id)}
        >
            <ContentEditable
                ref={textRef}
                html={value || "Text"}
                onChange={handleContentChange}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className={cn(
                    "outline-none w-full h-full text-center justify-center items-center flex",
                    font.className
                )}
                style={{
                    fontSize: fontSize,
                    color: colorToCss(fill) === "transparent" ? "#000" : colorToCss(fill),
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-all',
                    display: 'flex',
                }}
                spellCheck={false}
            />
        </foreignObject>
    );
};