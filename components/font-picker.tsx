import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FontSizePickerProps {
    selectedLayers: any;
    setLiveLayers: (layers: any) => void;
    liveLayers: any;
};

const fontSizes = [10, 12, 14, 18, 24, 36, 48, 56, 64, 80, 144];

export const FontSizePicker = ({
    selectedLayers,
    setLiveLayers,
    liveLayers,
}: FontSizePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputFontSize, setInputFontSize] = useState(liveLayers[selectedLayers[0]].textFontSize);

    const handleFontSizeChange = (fontSize: number) => {
        const newLayers = { ...liveLayers };
        selectedLayers.map((layerId: string) => {
            const originalFontSize = newLayers[layerId].textFontSize;
            const scaleFactor = fontSize / originalFontSize;

            newLayers[layerId].textFontSize = fontSize;
            newLayers[layerId].width *= scaleFactor;
            newLayers[layerId].height *= scaleFactor;
        })
        setLiveLayers(newLayers);
        setInputFontSize(fontSize);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputFontSize(parseInt(event.target.value));
    };

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        let fontSize = parseInt(event.target.value);
        if (!isNaN(fontSize)) {
            if (fontSize > 144) {
                fontSize = 144;
            } else if (fontSize < 10) {
                fontSize = 10
            }
            handleFontSizeChange(fontSize);
        }
    };

    const handleArrowClick = (direction: string) => {
        let currentIndex = fontSizes.indexOf(inputFontSize);
        if (currentIndex === -1) {
            currentIndex = fontSizes.reduce((prev, curr, index) =>
                Math.abs(curr - inputFontSize) < Math.abs(fontSizes[prev] - inputFontSize) ? index : prev, 0);
        }
        if (direction === 'up' && currentIndex < fontSizes.length - 1) {
            handleFontSizeChange(fontSizes[currentIndex + 1]);
        } else if (direction === 'down' && currentIndex > 0) {
            handleFontSizeChange(fontSizes[currentIndex - 1]);
        }
    };

    return (
        <div className="relative inline-block text-left">
            <div className='flex flex-row items center justify-center'>
                <div onClick={() => setIsOpen(!isOpen)}>
                    <input
                        type="number"
                        value={Math.round(inputFontSize)}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        className='h-8 w-8 text-center text-sm'
                    />
                </div>
                <div className='flex flex-col pl-3'>
                    <button onClick={() => handleArrowClick('up')}><ChevronUp className="h-4 w-4" /></button>
                    <button onClick={() => handleArrowClick('down')}><ChevronDown className="h-4 w-4" /></button>
                </div>
            </div>
            {isOpen && (
                <div
                    className="absolute mt-3 right-5 w-[65px] bg-white ring-1 ring-black ring-opacity-5"
                >
                    <div className="py-5 px-3 grid grid-cols-1 gap-5 w-full text-sm" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {fontSizes.map(fontSize => (
                            <button key={fontSize} onClick={() => handleFontSizeChange(fontSize)}>
                                {fontSize}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
};