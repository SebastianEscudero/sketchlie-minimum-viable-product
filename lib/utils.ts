import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { 
  ArrowHandle,
  Camera, 
  Color, 
  Layer, 
  LayerType, 
  PathLayer, 
  Point, 
  Side, 
  XYWH
} from "@/types/canvas";
import { toJpeg, toPng } from 'html-to-image';

const COLORS = [
  "#DC2626", // Red
  "#D97706", // Amber
  "#059669", // Teal
  "#7C3AED", // Violet
  "#DB2777",  // Pink
  "#3AB624", // Emerald
  "#2E5ADA", // Dark Blue
  "#6D2AC2", // Purple
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pointerEventToCanvasPoint(
  e: any,
  camera: Camera,
  zoom: number,
) {
  return {
    x: (Math.round(e.clientX) - camera.x) / zoom,
    y: (Math.round(e.clientY) - camera.y) / zoom,
  };
};

export function connectionIdToColor(connectionId: string): string {
  let hash = 0;
  for (let i = 0; i < connectionId.length; i++) {
      hash = (hash << 5) - hash + connectionId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};


export function colorToCss(color: Color) {
  return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}

export function resizeBounds(
  type: any,
  bounds: XYWH, 
  corner: Side, 
  point: Point,
  textareaRef?: React.RefObject<HTMLTextAreaElement>,
  layer?: Layer
): XYWH {

  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    textFontSize: 0
  };

  if (layer?.type === LayerType.Text) {
    result.textFontSize = layer.textFontSize;
  }

  const isCorner = corner === (Side.Top + Side.Left) || corner === (Side.Top + Side.Right) || corner === (Side.Bottom + Side.Left) || corner === (Side.Bottom + Side.Right);
  const aspectRatio = bounds.width / bounds.height;

  if ((type === LayerType.Text || type === LayerType.Image) && isCorner) {
    let newWidth = (corner & Side.Left) === Side.Left ? Math.abs(bounds.x + bounds.width - point.x) : Math.abs(point.x - bounds.x);
    let newHeight = newWidth / aspectRatio;

    if ((corner & Side.Left) === Side.Left) {
      result.x = bounds.x + (bounds.width - newWidth);
      result.width = newWidth;
    }

    if ((corner & Side.Right) === Side.Right) {
      result.width = newWidth;
    }

    if ((corner & Side.Top) === Side.Top) {
      result.y = bounds.y + (bounds.height - newHeight);
      result.height = newHeight;
    }

    if ((corner & Side.Bottom) === Side.Bottom) {
      result.height = newHeight;
    }
  } else {
    if ((corner & Side.Left) === Side.Left) {
      result.x = Math.min(point.x, bounds.x + bounds.width);
      result.width = Math.abs(bounds.x + bounds.width - point.x);
    }

    if ((corner & Side.Right) === Side.Right) {
      result.x = Math.min(point.x, bounds.x);
      result.width = Math.abs(point.x - bounds.x);
    }

    if ((corner & Side.Top) === Side.Top) {
      result.y = Math.min(point.y, bounds.y + bounds.height);
      result.height = Math.abs(bounds.y + bounds.height - point.y);
    }

    if ((corner & Side.Bottom) === Side.Bottom) {
      result.y = Math.min(point.y, bounds.y);
      result.height = Math.abs(point.y - bounds.y);
    }
  }

  if (layer && Math.abs((layer?.height / layer?.width) - (result.height / result.width)) < 0.0001 && layer.height !== result.height && layer.width !== result.width
  && textareaRef && textareaRef.current && layer.type === LayerType.Text) {
    const newFontSize = result.width / layer.width * layer.textFontSize
    result.textFontSize = newFontSize
    return result
  }

  if (!isCorner && textareaRef && textareaRef.current) {
    result.height = textareaRef.current.scrollHeight;
    return result
  } 

  return result;
};

export function resizeArrowBounds(
  bounds: any, 
  point: Point,
  handle: ArrowHandle,
): any {

  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    center: bounds.center,
  };

  if (handle === ArrowHandle.start) {
    const endPoint = { x: bounds.x + bounds.width, y: bounds.y + bounds.height };
    result.x = point.x;
    result.y = point.y;
    result.width = endPoint.x - point.x;
    result.height = endPoint.y - point.y;
  } else if (handle === ArrowHandle.end) {
    result.width = point.x - bounds.x;
    result.height = point.y - bounds.y;
  } else if (handle === ArrowHandle.center) {
    result.center.x += point.x - result.center.x;
    result.center.y += point.y - result.center.y;
  }

  if (handle === ArrowHandle.start || handle === ArrowHandle.end) {
    result.center.x = result.x + result.width / 2;
    result.center.y = result.y + result.height / 2;
  }

  return result;
}


export function getLayerIdAtPointer(current: Point, layers: { [key: string]: Layer }): string | null {
  for (const layerId in layers) {
    const layer = layers[layerId];

    if (
      current.x >= layer.x &&
      current.x <= layer.x + layer.width &&
      current.y >= layer.y &&
      current.y <= layer.y + layer.height
    ) {
      return layerId;
    }
  }

  return null;
}

export function findIntersectingLayersWithRectangle(
  layerIds: readonly string[],
  layers: { [key: string]: Layer },
  a: Point,
  b: Point,
) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids = [];

  for (const layerId of layerIds) {
    const layer = layers[layerId];

    if (layer == null) {
      continue;
    }

    if (layer.type === LayerType.Arrow && layer.center || layer.type === LayerType.Line && layer.center) {
      const { x, y, width, height, center } = layer;
      const length = Math.sqrt(width * width + height * height);
      const angle = Math.atan2(center.y - y, center.x - x);
      const end = {
        x: x + length * Math.cos(angle),
        y: y + length * Math.sin(angle),
      };

      if (
        rect.x + rect.width > Math.min(x, end.x) &&
        rect.x < Math.max(x, end.x) && 
        rect.y + rect.height > Math.min(y, end.y) &&
        rect.y < Math.max(y, end.y)
      ) {
        ids.push(layerId);
      }
    } else {
      const { x, y, height, width } = layer;

      if (
        rect.x + rect.width > x &&
        rect.x < x + width && 
        rect.y + rect.height > y &&
        rect.y < y + height
      ) {
        ids.push(layerId);
      }
    }
  }

  return ids;
};

export function getContrastingTextColor(color: Color) {
  if (color.r === 0 && color.g === 0 && color.b === 0) {
    return "black";
  }

  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

  return luminance > 182 ? "black" : "white";
};

export function penPointsToPathLayer(
  points: number[][],
  color: Color,
  pathStrokeSize: number,
): PathLayer {
  if (points.length < 2) {
    throw new Error("Cannot transform points with less than 2 points");
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const [x, y] = point;

    if (left > x) {
      left = x;
    }

    if (top > y) {
      top = y;
    }

    if (right < x) {
      right = x;
    }

    if (bottom < y) {
      bottom = y;
    }
  }

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    fill: color,
    strokeSize: pathStrokeSize,
    points: points
      .map(([x, y, pressure]) => [x - left, y - top, pressure]),
  };
};

function toDomPrecision(v: number) {
	return Math.round(v * 1e4) / 1e4
}

function average(A: number[], B: number[]): string {
  return `${toDomPrecision((A[0] + B[0]) / 2)},${toDomPrecision((A[1] + B[1]) / 2)} `;
}

function precise(A: number[]): string {
  return `${toDomPrecision(A[0])},${toDomPrecision(A[1])} `;
}

export function getSvgPathFromPoints(points: number[][], closed = false): string {
  const len = points.length;

  if (len < 2) {
    return '';
  }

  let d = `M${precise(points[0])}`;

  for (let i = 0; i < len - 1; i++) {
    const midPoint = average(points[i], points[i + 1]);
    d += `Q${precise(points[i])} ${midPoint}`;
  }

  if (closed) {
    d += `Q${precise(points[len - 1])} ${precise(points[0])}Z`;
  } else {
    d += `L${precise(points[len - 1])}`;
  }

  return d;
}
export const NAME = "Sketchlie";

export const exportToPNG = async () => {
  const screenShot = document.getElementById("canvas") as HTMLElement;
  screenShot.style.backgroundColor = '#F4F4F4';
  toPng(screenShot, { quality: 1 }).then((dataUrl) => {
    var anchor = document.createElement("a");
    anchor.setAttribute("href", dataUrl);
    anchor.setAttribute("download", `Tablero.png`);
    anchor.click();
    anchor.remove();
  })
};

export const exportToSVG = async (title: string) => {
  // implement
};