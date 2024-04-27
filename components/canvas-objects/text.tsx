import React, { useState, useEffect, useRef } from 'react';
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { TextLayer } from "@/types/canvas";
import { cn, colorToCss } from "@/lib/utils";
import { Kalam } from "next/font/google";

const calculateFontSize = (width: number, height: number) => {
    const scaleFactor = 0.4;
    const geometricMean = Math.sqrt(width * height);
    return geometricMean * scaleFactor;
}
const font = Kalam({
    subsets: ["latin"],
    weight: ["400"],
});

interface TextProps {
    id: string;
    layer: TextLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
};

export const Text = ({
    layer,
    onPointerDown,
    id,
    selectionColor,
}: TextProps) => {
    const { x, y, width, height, fill, value } = layer;
    const [prevWidth, setPrevWidth] = useState(width);
    const [prevHeight, setPrevHeight] = useState(height);
    const [fontSize, setFontSize] = useState(calculateFontSize(width, height));
    const textRef = useRef<any>(null);

    const updateValue = (newValue: string) => {
        const storedLayers = localStorage.getItem('layers');
        const layers = storedLayers ? JSON.parse(storedLayers) : {};
        if (layers[id]) {
          layer.value = newValue;
        }
        localStorage.setItem('layers', JSON.stringify(layers));
      };

    const handleContentChange = (e: ContentEditableEvent) => {
        updateValue(e.target.value);
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