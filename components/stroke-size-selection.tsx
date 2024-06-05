import { Slider } from '@/components/ui/slider';

interface PathStokeSizeSelectionProps {
    selectedLayers: any;
    setLiveLayers: (layers: any) => void;
    liveLayers: any;
};

export const PathStokeSizeSelection = ({
    selectedLayers,
    setLiveLayers,
    liveLayers,
}: PathStokeSizeSelectionProps) => {

    const strokeSize = liveLayers[selectedLayers[0]].strokeSize;

    const handleStrokeSizeChange = (newStrokeSize: number[]) => {
        const newLayers = { ...liveLayers };
        const updatedIds: any = [];
        const updatedLayers: any = [];

        selectedLayers.map((layerId: string) => {
            const layer = newLayers[layerId];
            newLayers[layerId] = { ...layer, strokeSize: newStrokeSize };

            updatedIds.push(layerId);
            updatedLayers.push({
                startArrowHead: newLayers[layerId].startArrowHead,
                endArrowHead: newLayers[layerId].endArrowHead,
            });
        });

        localStorage.setItem("layers", JSON.stringify(newLayers));
        setLiveLayers(newLayers);
    }

    return (
        <div className="relative inline-block text-left pl-1">
            <div className='flex flex-row items center justify-center gap-x-1'>
            <Slider
                defaultValue={[strokeSize || 2]}
                min={1}
                max={8}
                step={1}
                className='w-20 cursor-pointer'
                onValueChange={handleStrokeSizeChange}
            />
            </div>
        </div>
    )
};