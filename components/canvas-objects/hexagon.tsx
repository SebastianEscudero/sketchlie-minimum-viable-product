import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { LayerType, HexagonLayer } from "@/types/canvas";
import { cn, colorToCss, getContrastingTextColor, removeHighlightFromText } from "@/lib/utils";
import { memo, useEffect, useRef, useState } from "react";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

interface HexagonProps {
  id: string;
  layer: HexagonLayer;
  onPointerDown?: (e: any, id: string) => void;
  selectionColor?: string;
  setLiveLayers?: (layers: any) => void;
  focused?: boolean;
};

export const Hexagon = memo(({
  layer,
  onPointerDown,
  id,
  selectionColor,
  setLiveLayers,
  focused = false
}: HexagonProps) => {
  const { x, y, width, height, fill, outlineFill, value: initialValue, textFontSize } = layer;
  const alignX = layer.alignX || "center";
  const alignY = layer.alignY || "center";
  const [value, setValue] = useState(initialValue);
  const fillColor = colorToCss(fill);
  const HexagonRef = useRef<any>(null);

  useEffect(() => {
    setValue(layer.value);
  }, [id, layer]);

  useEffect(() => {
    if (!focused) {
      removeHighlightFromText();
    }
  }, [focused])

  const updateValue = (newValue: string) => {
    if (layer && layer.type === LayerType.Hexagon) {
      const noteLayer = layer as HexagonLayer;
      noteLayer.value = newValue;
      setValue(newValue);
      setLiveLayers?.((prevLayers: any) => {
        const updatedLayers = { ...prevLayers, [id]: layer };
        localStorage.setItem('layers', JSON.stringify(updatedLayers));
        return updatedLayers;
      });
    }
  };

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

  const handlePointerDown = (e: React.PointerEvent) => {

    if (e.pointerType === "touch") {
      return;
    }

    if (e.target === HexagonRef.current) {

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
      HexagonRef.current.focus();
    }

    if (onPointerDown) {
      onPointerDown(e, id);
    }
  };

  const handleTouchDown = (e: React.TouchEvent) => {
    if (e.touches.length > 1 || document.activeElement === HexagonRef.current) {
      e.preventDefault();
      return;
    }

    if (e.target === HexagonRef.current) {
      if (focused) {
        e.stopPropagation();
      } else {
        e.preventDefault();
        if (onPointerDown) onPointerDown(e, id);
      }
      return;
    }

    if (!focused && onPointerDown) {
      onPointerDown(e, id);
    }
  }

  if (!fill) {
    return null;
  }

  const divWidth = width * 0.65;
  const divHeight = height * 0.65;

  // Calculate the position to center the foreignObject within the Hexagon
  const foreignObjectX = (width - divWidth) / 2;
  const foreignObjectY = (height - divHeight) / 2;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onPointerDown={(e) => handlePointerDown(e)}
      onTouchStart={(e) => handleTouchDown(e)}
    >
      <path
        d={`M ${width * 0.5},${0} L ${width}, ${height * 0.25} L ${width}, ${height * 0.75} L ${width * 0.5}, ${height} L 0, ${height * 0.75} L 0, ${height * 0.25} Z`} fill={fillColor}
        stroke={selectionColor || colorToCss(outlineFill || fill)}
        strokeWidth="2"
      />
      <foreignObject
        x={foreignObjectX} // Adjust x position to center the foreignObject
        y={foreignObjectY} // Adjust y position to center the foreignObject
        width={divWidth} // Adjust width to 80% of the Hexagon's width
        height={divHeight} // Adjust height to 80% of the Hexagon's height
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className={`h-full w-full flex ${alignY === 'top' ? 'items-start' : alignY === 'bottom' ? 'items-end' : 'items-center'} ${alignX === 'left' ? 'justify-start' : alignX === 'right' ? 'justify-end' : 'justify-center'} p-1`}
        >
          <ContentEditable
            innerRef={HexagonRef}
            html={value || ""}
            onChange={handleContentChange}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              // Check if the pressed key is Enter
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent the default Enter key behavior

                // Insert a new line at the current cursor position
                document.execCommand('insertHTML', false, '<br><br>');
              }
            }}
            className={cn(
              "outline-none w-full p-1",
              font.className
            )}
            style={{
              fontSize: textFontSize,
              color: fill ? getContrastingTextColor(fill) : "#000",
              textWrap: "wrap",
              WebkitUserSelect: 'auto',
              textAlign: alignX
            }}
            spellCheck={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </foreignObject>
    </g>
  );
});

Hexagon.displayName = 'Hexagon';