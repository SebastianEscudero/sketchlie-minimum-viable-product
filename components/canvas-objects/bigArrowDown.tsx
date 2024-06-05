import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { LayerType, BigArrowDownLayer } from "@/types/canvas";
import { cn, colorToCss, getContrastingTextColor } from "@/lib/utils";
import { memo, useEffect, useRef, useState } from "react";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

interface BigArrowDownProps {
  id: string;
  layer: BigArrowDownLayer;
  onPointerDown?: (e: any, id: string) => void;
  selectionColor?: string;
  onRefChange?: (ref: React.RefObject<any>) => void;
  setLiveLayers?: (layers: any) => void;
};

export const BigArrowDown = memo(({
  layer,
  onPointerDown,
  id,
  selectionColor,
  onRefChange,
  setLiveLayers
}: BigArrowDownProps) => {
  const { x, y, width, height, fill, outlineFill, value: initialValue, textFontSize } = layer;
  const [value, setValue] = useState(initialValue);
  const fillColor = colorToCss(fill);
  const BigArrowDownRef = useRef<any>(null);

  useEffect(() => {
    setValue(layer.value);
  }, [id, layer]);
  
  const updateValue = (newValue: string) => {
    if (layer && layer.type === LayerType.BigArrowDown) {
      const noteLayer = layer as BigArrowDownLayer;
      noteLayer.value = newValue;
      setValue(newValue);
      setLiveLayers?.((prevLayers: any) => {
        const updatedLayers = { ...prevLayers, [id]: layer };
        localStorage.setItem('layers', JSON.stringify(updatedLayers));
        return updatedLayers;
      });
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
      onRefChange(BigArrowDownRef);
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
      onRefChange(BigArrowDownRef);
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
      onRefChange(BigArrowDownRef);
    }
  }, [layer]);

  if (!fill) {
    return null;
  }

  return (
    <g
        transform={`translate(${x}, ${y + height / 2})`}
        onPointerMove={(e) => {
            if (e.buttons === 1) {
                handlePointerDown(e);
            }
        }}
        onPointerDown={(e) => handlePointerDown(e)}
        onTouchStart={(e) => handleOnTouchDown(e)}
    >
        <path
            d={`M ${width / 2} ${height - height / 2} L 0 ${height / 2 - height / 2} L ${width / 4} ${height / 2 - height / 2} L ${width / 4} ${0 - height / 2} L ${width * 3 / 4} ${0 - height / 2} L ${width * 3 / 4} ${height / 2 - height / 2} L ${width} ${height / 2 - height / 2} Z`} fill={fillColor}
            stroke={selectionColor || colorToCss(outlineFill || fill)}
            strokeWidth="2"
        />
        <foreignObject
            x={0}
            y={-height / 2}
            width={width}
            height={height}
            className="flex items-center justify-center"
        >
            <ContentEditable
                innerRef={BigArrowDownRef}
                onKeyDown={handleKeyDown}
                html={value || ""}
                onChange={handleContentChange}
                onPaste={handlePaste}
                className={cn(
                    "h-full w-full flex items-center justify-center text-center outline-none",
                    font.className
                )}
                style={{
                    fontSize: textFontSize,
                    color: fill ? getContrastingTextColor(fill) : "#000",
                    textWrap: "wrap",
                    lineHeight: value ? 'normal' : `${height}px`,
                    WebkitUserSelect: 'auto'
                }}
                spellCheck={false}
            />
        </foreignObject>
    </g>
);
});

BigArrowDown.displayName = 'BigArrowDown';