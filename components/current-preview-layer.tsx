import { LayerType, PreviewLayer } from "@/types/canvas";
import { memo } from "react";
import { Rectangle } from "./canvas-objects/rectangle";
import { Ellipse } from "./canvas-objects/ellipse";
import { Text } from "./canvas-objects/text";
import { Note } from "./canvas-objects/note";

interface PreviewLayerProps {
    layer: PreviewLayer;
};


export const CurrentPreviewLayer = memo(({
    layer,
}: PreviewLayerProps) => {
    switch (layer.type) {
        case LayerType.Rectangle:
            return (
                <Rectangle
                    id="PreviewRectangle"
                    layer={layer}
                />
            );
        case LayerType.Ellipse:
            return (
                <Ellipse
                    id="EllipsePreview"
                    layer={layer}
                />
            );
        case LayerType.Text:
            return (
                <Text
                    id="TextPreview"
                    layer={layer}
                />
            );
        case LayerType.Note:
            return (
                <Note
                    id="NotePreview"
                    layer={layer}
                />
            );
    }
});

CurrentPreviewLayer.displayName = "currentLayerPreview";