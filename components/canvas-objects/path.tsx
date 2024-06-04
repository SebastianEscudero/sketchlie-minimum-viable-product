import { getSvgPathFromPoints } from "@/lib/utils";

interface PathProps {
    x: number;
    y: number;
    points: number[][];
    fill: string;
    onPointerDown?: (e: React.PointerEvent) => void;
    onPathErase?: (e: React.PointerEvent) => void;
    stroke?: string;
    strokeSize?: number | undefined;
    zoomRef?: React.RefObject<any>;
};

export const Path = ({
    x,
    y,
    points,
    fill,
    onPointerDown,
    onPathErase,
    stroke,
    strokeSize,
    zoomRef,
}: PathProps) => {

    const isTransparent = fill === 'rgba(0,0,0,0)';

    return (
        <path
            onPointerMove={onPathErase}
            onPointerDown={onPointerDown}
            d={getSvgPathFromPoints(points)}
            style={{
                transform: `translate(${x}px, ${y}px)`,
                pointerEvents: "all"
            }}
            x={0}
            y={0}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            stroke={stroke ?? (isTransparent ? 'black' : fill)}
            strokeWidth={strokeSize ?? 1 / (zoomRef?.current ?? 1)**2}
            />
    );
};