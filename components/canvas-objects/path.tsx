import getStroke from "perfect-freehand";

import { getSvgPathFromStroke } from "@/lib/utils";

interface PathProps {
    x: number;
    y: number;
    points: number[][];
    fill: string;
    onPointerDown?: (e: React.PointerEvent) => void;
    stroke?: string;
};

export const Path = ({
    x,
    y,
    points,
    fill,
    onPointerDown,
    stroke,
}: PathProps) => {

    const isTransparent = fill === 'rgba(0,0,0,0)';

    return (
        <path
            onPointerDown={onPointerDown}
            d={getSvgPathFromStroke(
                getStroke(points, {
                    size: 10,
                    thinning: 0.5,
                    smoothing: 0.5,
                    streamline: 0.5,
                })
            )}
            style={{
                transform: `translate(${x}px, ${y}px)`,
            }}
            x={0}
            y={0}
            fill={isTransparent ? '#000' : fill}
            stroke={stroke}
            strokeWidth={1}
        />
    );
};