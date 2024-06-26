import { getSvgPathFromPoints } from "@/lib/utils";

interface PathProps {
    x: number;
    y: number;
    points: number[][];
    fill: string;
    onPointerDown?: (e: React.PointerEvent) => void;
    stroke?: string;
    strokeSize?: number | undefined;
};

export const Path = ({
    x,
    y,
    points,
    fill,
    onPointerDown,
    stroke,
    strokeSize,
}: PathProps) => {

    const isTransparent = fill === 'rgba(0,0,0,0)';

    return (
        <path
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
            strokeWidth={strokeSize}
            />
    );
};