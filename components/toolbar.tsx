import { 
    Circle, 
    Hand, 
    Image, 
    MousePointer2, 
    MoveUpRight, 
    Pencil, 
    Square, 
    StickyNote, 
    Type,
  } from "lucide-react";
  
import { CanvasMode, CanvasState, LayerType } from "@/types/canvas";
import { ToolButton } from "./tool-button";
import { ImageButton } from "./image-button";
  
  interface ToolbarProps {
    canvasState: CanvasState;
    setCanvasState: (newState: CanvasState) => void;
    onImageSelect: (src: string) => void;
  };
  
  export const Toolbar = ({
    canvasState,
    setCanvasState,
    onImageSelect,
  }: ToolbarProps) => {
    return (
      <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
        <div className="bg-white rounded-md p-1.5 flex gap-y-1 flex-col items-center shadow-md">
          <ToolButton
            label="Select"
            icon={MousePointer2}
            onClick={() => setCanvasState({ 
              mode: CanvasMode.None
            })}
            isActive={
              canvasState.mode === CanvasMode.None ||
              canvasState.mode === CanvasMode.Translating ||
              canvasState.mode === CanvasMode.SelectionNet ||
              canvasState.mode === CanvasMode.Pressing ||
              canvasState.mode === CanvasMode.Resizing
            }
          />
          <ToolButton
            label="Move"
            icon={Hand}
            onClick={() => setCanvasState({ 
              mode: CanvasMode.Moving
            })}
            isActive={
              canvasState.mode === CanvasMode.Moving
            }
          />
          <ToolButton
            label="Text"
            icon={Type}
            onClick={() => setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })}
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Text
            }
          />
          <ToolButton
            label="Sticky note"
            icon={StickyNote}
            onClick={() => setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            })}
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Note
            }
          />
          <ToolButton
            label="Rectangle"
            icon={Square}
            onClick={() => setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })}
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Rectangle
            }
          />
          <ToolButton
            label="Ellipse"
            icon={Circle}
            onClick={() => setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })}
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Ellipse
            }
          />
          <ToolButton
            label="Arrow"
            icon={MoveUpRight}
            onClick={() => setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Arrow,
            })}
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Arrow
            }
          />
          {/* <ImageButton 
            onImageSelect={onImageSelect}
            label="Image"
            icon={Image}
            onClick={() => setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Image,
            })}
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Image
            }
          /> */}
          <ToolButton
            label="Pen"
            icon={Pencil}
            onClick={() => setCanvasState({
              mode: CanvasMode.Pencil,
            })}
            isActive={
              canvasState.mode === CanvasMode.Pencil
            }
          />
        </div>
      </div>
    );
  };
  
  export const ToolbarSkeleton = () => {
    return (
      <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md rounded-md" />
    );
  };