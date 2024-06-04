import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { LayerType, CommentBubbleLayer } from "@/types/canvas";
import { cn, colorToCss, getContrastingTextColor } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

interface CommentBubbleProps {
  id: string;
  layer: CommentBubbleLayer;
  onPointerDown?: (e: any, id: string) => void;
  selectionColor?: string;
  onRefChange?: (ref: React.RefObject<any>) => void;
  setLiveLayers?: (layers: any) => void;
};

export const CommentBubble = ({
  layer,
  onPointerDown,
  id,
  selectionColor,
  onRefChange,
  setLiveLayers
}: CommentBubbleProps) => {
  const { x, y, width, height, fill, outlineFill, value: initialValue, textFontSize } = layer;
  const [value, setValue] = useState(initialValue);
  const fillColor = colorToCss(fill);
  const CommentBubbleRef = useRef<any>(null);
  const storedLayers = localStorage.getItem('layers');
  const liveLayers = storedLayers ? JSON.parse(storedLayers) : {};

  useEffect(() => {
    const storedLayers = localStorage.getItem('layers');
    const layers = storedLayers ? JSON.parse(storedLayers) : {};
    setValue(layers[id]?.value);
  }, [id]);
  
  const updateValue = (newValue: string) => {
    if (liveLayers[id] && liveLayers[id].type === LayerType.CommentBubble) {
      const noteLayer = liveLayers[id] as CommentBubbleLayer;
      noteLayer.value = newValue;
      setValue(newValue);
      const newLiveLayers = { ...liveLayers, [id]: noteLayer };
      if (setLiveLayers) {
        setLiveLayers(newLiveLayers);
      }
      localStorage.setItem('layers', JSON.stringify(liveLayers));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const br = document.createElement('br');
        range.insertNode(br);
        // Create another <br> element
        const extraBr = document.createElement('br');
        range.insertNode(extraBr);
        // Move the cursor to the new line
        range.setStartAfter(extraBr);
        range.collapse(true);
        const newEvent = new Event('input', { bubbles: true });
        e.currentTarget.dispatchEvent(newEvent);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (onPointerDown) onPointerDown(e, id);
    if (onRefChange) {
      onRefChange(CommentBubbleRef);
    }
  };

  const handleOnTouchDown = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 1) {
      return;
    }
    if (onPointerDown) {
      onPointerDown(e, id);
    }
    if (onRefChange) {
      onRefChange(CommentBubbleRef);
    }
  }

  const handleContentChange = (e: ContentEditableEvent) => {
    updateValue(e.target.value);
  };

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
    if (onRefChange) {
      onRefChange(CommentBubbleRef);
    }
  }, [layer]);

  if (!fill) {
    return null;
  }

  return (
    <g
        transform={`translate(${x}, ${y})`}
        onPointerMove={(e) => {
            if (e.buttons === 1) {
                handlePointerDown(e);
            }
        }}
        onPointerDown={(e) => handlePointerDown(e)}
        onTouchStart={(e) => handleOnTouchDown(e)}
    >
        <path
            d={`M 0 0 L ${width} 0 L ${width} ${height * 4 / 5} L ${width / 2.5} ${height * 4 / 5} L ${width / 5} ${height} L ${width / 5} ${height * 4 / 5} L 0 ${height * 4 / 5} Z`}
            fill={fillColor}
            stroke={selectionColor || colorToCss(outlineFill || fill)}
            strokeWidth="2"
        />
        <foreignObject
            x="0"
            y="0"
            width={width}
            height={height}
            className="flex items-center justify-center"
        >
            <ContentEditable
                innerRef={CommentBubbleRef}
                onKeyDown={handleKeyDown}
                html={value || ""}
                onChange={handleContentChange}
                onPaste={handlePaste}
                className={cn(
                    "h-full w-full flex justify-center text-center outline-none items-center pb-4",
                    value ? "" : "items-start",
                    font.className
                  )}
                style={{
                    fontSize: textFontSize,
                    color: fill ? getContrastingTextColor(fill) : "#000",
                    textWrap: "wrap",
                    lineHeight: value ? 'normal' : `${height-20}px`,
                    WebkitUserSelect: 'auto'
                }}
                spellCheck={false}
            />
        </foreignObject>
    </g>
);
};