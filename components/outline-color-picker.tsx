"use client";

import { Color } from "@/types/canvas";
import { colorToCss } from "@/lib/utils";
import { useState } from 'react';

interface OutlineColorPickerProps {
  onChange: (color: Color) => void;
  layers: any;
};


export const OutlineColorPicker = ({
  onChange,
  layers
}: OutlineColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  let colorButtonColor
  if (layers.length === 1) {
    colorButtonColor = layers[0].outlineFill;
  } else {
    colorButtonColor = { r: 0, g: 0, b: 0, a: 0 };
  }

  return (
    <div className="relative text-left border-r px-1 border-neutral-200">
      <OutlineColorButton color={colorButtonColor} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-[210px] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
        >
          <div className="p-3 grid grid-cols-4 gap-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <ColorButton color={{ r: 0, g: 0, b: 0, a: 0 }} onClick={onChange} />
              <ColorButton color={{ r: 255, g: 255, b: 255, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 29, g: 29, b: 29, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 159, g: 168, b: 178, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 255, g: 240, b: 0, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 252, g: 225, b: 156, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 225, g: 133, b: 244, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 174, g: 62, b: 201, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 68, g: 101, b: 233, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 75, g: 161, b: 241, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 255, g: 165, b: 0, a: 1 }} onClick={onChange} />
              <ColorButton color={{ a: 1, b: 42, g: 142, r: 252 }} onClick={onChange} />
              <ColorButton color={{ r: 7, g: 147, b: 104, a: 1 }} onClick={onChange} />
              <ColorButton color={{ a: 1, b: 99, g: 202, r: 68 }} onClick={onChange} />
              <ColorButton color={{ r: 248, g: 119, b: 119, a: 1 }} onClick={onChange} />
              <ColorButton color={{ r: 224, g: 49, b: 49, a: 1 }} onClick={onChange} />
          </div>
        </div>
      )}
    </div>
  )
};

interface ColorButtonProps {
  onClick: (color: Color) => void;
  color: Color;
};

const ColorButton = ({
  onClick,
  color,
}: ColorButtonProps) => {
  return (
    <button
      className="w-8 h-8 my-1 items-center flex justify-center transition mx-2"
      onClick={() => onClick(color)}
    >
      <div
        className="h-7 w-7 rounded-[50%] border border-neutral-300 relative"
        style={{ background: colorToCss(color) }}
      >
        {color.r === 0 && color.g === 0 && color.b === 0 && color.a === 0 && (
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1 1">
            <line x1="0.15" y1="0.15" x2="0.85" y2="0.85" stroke="#d4d4d4" strokeWidth="0.05" />
          </svg>
        )}
      </div>
    </button>
  )
}

const OutlineColorButton = ({
  onClick,
  color,
}: ColorButtonProps) => {
  return (
    <button
      className="w-8 h-8 my-1 items-center flex justify-center transition mx-2 border border-neutral-300 rounded-[50%]"
      onClick={() => onClick(color)}
      style={{ background: colorToCss(color) }}
    >
      <div
        className="h-6 w-6 rounded-[50%] border border-neutral-300 relative z-50"
        style={{ background: 'white' }}
      >
        {color.r === 0 && color.g === 0 && color.b === 0 && color.a === 0 && (
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1 1">
            <line x1="0.15" y1="0.15" x2="0.85" y2="0.85" stroke="#d4d4d4" strokeWidth="0.05" />
          </svg>
        )}
      </div>
    </button>
  )
}