import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { TextLayer } from "@/types/canvas";
import { cn, colorToCss } from "@/lib/utils";
import { Kalam } from "next/font/google";

const font = Kalam({
    subsets: ["latin"],
    weight: ["400"],
});

interface TextProps {
    setLiveLayers?: (layers: any) => void;
    id: string;
    layer: TextLayer;
    onPointerDown?: (e: any, id: string) => void;
    selectionColor?: string;
    onRefChange?: (ref: React.RefObject<any>) => void;
    focused?: boolean;
};

  export const Text = memo(({
    layer,
    onPointerDown,
    id,
    selectionColor,
    setLiveLayers,
    onRefChange,
    focused = false
}: TextProps) => {
    const { x, y, width, height, fill, value: initialValue, textFontSize } = layer;
    const alignX = layer.alignX || "center";
    const [value, setValue] = useState(initialValue);
    const textRef = useRef<any>(null);
    const fillColor = colorToCss(layer.fill);
    const isTransparent = fillColor === 'rgba(0,0,0,0)';

    const handlePointerDown = useCallback((e: React.PointerEvent) => {

        if (e.pointerType === "touch") {
            return;
          }

          onRefChange?.(textRef);
      
          if (e.target === textRef.current) {
      
            if (focused) {
              e.stopPropagation();
            } else {
              e.preventDefault();
              if (onPointerDown) onPointerDown(e, id);
            }
            return;
          } else if (focused) {
            e.preventDefault();
            e.stopPropagation();
            textRef.current.focus();
          }
      
          if (onPointerDown) {
            onPointerDown(e, id);
          }
    }, [onPointerDown, id, onRefChange, focused]);

    const handleOnTouchDown = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        if (e.touches.length > 1) {
          return;
        }
        onPointerDown?.(e, id);
        onRefChange?.(textRef);
    }, [onPointerDown, id, onRefChange]);

    const handleContentChange = useCallback((newValue: string) => {
        setValue(newValue);
        const newLayer = { ...layer, value: newValue };
        textRef.current.style.height = `${textFontSize*1.5}px`;
        newLayer.height = textRef.current.scrollHeight;
        if (setLiveLayers) {
            setLiveLayers((prevLayers: any) => {
                return { ...prevLayers, [id]: { ...newLayer } };
            });
        }
    }, [layer, textFontSize, setLiveLayers, id]);

    useEffect(() => {
        if (textRef.current) {
            textRef.current.focus();
        }
    }, []);

    useEffect(() => {        
        textRef.current.style.height = `${textFontSize*1.5}px`;
        textRef.current.style.height = `${textRef.current.scrollHeight}px`;
    }, [width, value, id, height, layer, textFontSize]);
    
    if (!fill) {
        return null;
    }

    return (
        <g transform={`translate(${x}, ${y})`}>
            <foreignObject
                width={width}
                height={height}
                style={{
                    outline: selectionColor ? `2px solid ${selectionColor}` : "none",
                }}
                onPointerDown={(e) => handlePointerDown(e)}
                onTouchStart={(e) => handleOnTouchDown(e)}
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
                        "outline-none w-full h-full text-left flex px-0.5 bg-transparent",
                        font.className
                    )}
                    style={{
                        color: isTransparent ? "#000" : fillColor,
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-all',
                        resize: "none",
                        overflowY: "hidden",
                        overflowX: "hidden",
                        userSelect: "none",
                        fontSize: textFontSize,
                        textAlign: alignX
                    }}
                />
            </foreignObject>
        </g>
    );
});

Text.displayName = 'Text';