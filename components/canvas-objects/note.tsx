import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { NoteLayer } from "@/types/canvas";
import { cn, colorToCss, getContrastingTextColor } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

interface NoteProps {
  id: string;
  layer: NoteLayer;
  onPointerDown?: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
};

export const Note = ({
  layer,
  onPointerDown,
  id,
  selectionColor,
}: NoteProps) => {
  const { x, y, width, height, fill, outlineFill, value: initialValue, textFontSize } = layer;
  const [value, setValue] = useState(initialValue);
  const fillColor = colorToCss(fill);
  const noteRef = useRef<any>(null);

  useEffect(() => {
    const storedLayers = localStorage.getItem('layers');
    const layers = storedLayers ? JSON.parse(storedLayers) : {};
    setValue(layers[id]?.value);
  }, [id]);

  const updateValue = (newValue: string) => {
    const storedLayers = localStorage.getItem('layers');
    const layers = storedLayers ? JSON.parse(storedLayers) : {};
    if (layers[id]) {
      layers[id].value = newValue;
      localStorage.setItem('layers', JSON.stringify(layers));
      setValue(newValue);
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

  useEffect(() => {
    if (noteRef.current) {
        noteRef.current.focus();
    }
  }, []);

  if (!fill) {
    return null;
  }

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={onPointerDown ? (e) => onPointerDown(e, id) : undefined}
      style={{
        borderColor: `${selectionColor || colorToCss(outlineFill || fill)}`,
        backgroundColor: fillColor,
      }}
      className="shadow-md drop-shadow-xl flex items-center justify-center border-[1.5px] border-spacing-3"
    >
      <ContentEditable
        innerRef={noteRef}
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
  );
};