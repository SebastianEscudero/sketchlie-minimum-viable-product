"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Hint } from "@/components/hint";
import { Menu, Zap } from "lucide-react";
import { Actions } from "./actions";
import { Layers } from "@/types/canvas";
import { useState } from "react";
import { NeedMore } from "./need-more";

const TabSeparator = () => {
    return(
        <div className="text-neutral-300 px-1.5">
            |
        </div>
    )
}

interface InfoProps {
    setLiveLayers: (layers: Layers) => void;
    setLiveLayersId: (layersId: string[]) => void;
    selectedLayers: string[];
}

export const Info = ({
    setLiveLayersId,
    setLiveLayers,
    selectedLayers
}: InfoProps) => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    return(
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
            <Hint label="Go to Sketchlie" side="bottom" sideOffset={10}>
                <Button asChild variant="board" className="px-2">
                    <Link href="https://www.sketchlie.com/">
                        <Image 
                        src="/logo.svg"
                        alt="Board logo"
                        height={40}
                        width={40}
                        />
                        <span className="font-semibold text-xl ml-2 text-black sm:flex hidden">
                            Sketchlie
                        </span>
                    </Link>
                </Button>
            </Hint>
            <TabSeparator />
            <Actions 
                selectedLayers={selectedLayers}
                setLiveLayers={setLiveLayers}
                setLiveLayersId={setLiveLayersId}
                side="bottom" sideOffset={10}>
                <div>
                    <Hint label="Main menu" side="bottom" sideOffset={10}>
                        <Button size="icon" variant="board">
                            <Menu />
                        </Button>
                    </Hint>
                </div>
            </Actions>
            <TabSeparator />
            <Hint label="¿Necesitas más?" side="bottom" sideOffset={10}>
                <Button variant="board"
                    size="icon"
                    onClick={() => setDialogOpen(true)}
                >
                    <Zap className="h-5 w-5 fill-custom-blue text-custom-blue"/>
                </Button>
            </Hint>
            <NeedMore isOpen={isDialogOpen} onClose={() => setDialogOpen(false)} />
        </div>
    )
}

export const InfoSkeleton = () => {
    return(
        <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]"/>
    );
};