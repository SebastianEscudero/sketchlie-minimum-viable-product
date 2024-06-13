import { Button } from '@/components/ui/button';
import { ArrowHead } from '@/types/canvas';
import { MoveLeft, MoveRight, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

interface ArrowHeadSelectionProps {
    selectedLayers: any;
    setLiveLayers: (layers: any) => void;
    liveLayers: any;
};

export const ArrowHeadSelection = ({
    selectedLayers,
    setLiveLayers,
    liveLayers,
}: ArrowHeadSelectionProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHead, setSelectedHead] = useState<'start' | 'end'>('start');
    const layer = liveLayers[selectedLayers[0]]
    const startArrowHead = layer.startArrowHead;
    const endArrowHead = layer.endArrowHead;

    const handleArrowHeadChange = (newArrowHead: ArrowHead) => {
        const newLayers = { ...liveLayers };
        const updatedLayers: any = [];

        selectedLayers.map((layerId: string) => {
            const layer = newLayers[layerId];
            if (selectedHead === 'start') {
                newLayers[layerId] = { ...layer, startArrowHead: newArrowHead };
            } else {
                newLayers[layerId] = { ...layer, endArrowHead: newArrowHead };
            }

            updatedLayers.push({
                startArrowHead: newLayers[layerId].startArrowHead,
                endArrowHead: newLayers[layerId].endArrowHead,
            });
        });
        
        localStorage.setItem("layers", JSON.stringify(newLayers));
        setLiveLayers(newLayers);
        setIsOpen(false);
    }

    const reverseHeads = (startArrowHead: ArrowHead, endArrowHead: ArrowHead) => {
        const newLayers = { ...liveLayers };
        const updatedIds: any = [];
        const updatedLayers: any = [];

        selectedLayers.map((layerId: string) => {
            const layer = newLayers[layerId];
            newLayers[layerId] = { ...layer, startArrowHead: endArrowHead, endArrowHead: startArrowHead };


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
                <Button variant="board" size="default" onClick={() => { setIsOpen(!isOpen); setSelectedHead('start') }}>
                    {startArrowHead === ArrowHead.Triangle ? <MoveLeft /> : <span>None</span>}
                </Button>
                <Button variant="board" size="icon" onClick={() => reverseHeads(startArrowHead, endArrowHead)}>
                    <RefreshCcw />
                </Button>
                <Button variant="board" size="default" onClick={() => { setIsOpen(!isOpen); setSelectedHead('end') }}>
                    {endArrowHead === ArrowHead.Triangle ? <MoveRight /> : <span>None</span>}
                </Button>
            </div>
            {isOpen && (
                <div
                    className={`absolute mt-3 ${selectedHead === 'start' ? 'left-[-10px]' : 'right-[-10px]'} w-[75px] bg-white ring-1 ring-black ring-opacity-5`}
                >
                    <div className="p-3 grid grid-cols-1 gap-2 w-full text-sm" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <Button variant="board" size="default" onClick={() => handleArrowHeadChange(ArrowHead.None)}>
                            None
                        </Button>
                        <Button variant="board" size="default" onClick={() => handleArrowHeadChange(ArrowHead.Triangle)}>
                            {selectedHead === 'start' ? <MoveLeft /> : <MoveRight />}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
};