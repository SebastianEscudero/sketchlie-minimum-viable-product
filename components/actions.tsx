"use client";

import { toast } from "sonner";
import { Check, ChevronRight, Eye, FilePlus2 } from "lucide-react";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "./confirm-delete-board";
import { ExportDropdownMenu } from "./ExportDropDownMenu";
import { BackgroundMenu } from "./background-menu";

interface ActionsProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    setLiveLayers: (layers: any) => void;
    setLiveLayersId: (layersId: string[]) => void;
    setBackground?: (background: string) => void;
    Background?: string;
};

export const Actions = ({
    children,
    side,
    sideOffset,
    setLiveLayers,
    setLiveLayersId,
    setBackground,
    Background,
}: ActionsProps) => {

    let liveLayers = localStorage.getItem("layers");

    if (liveLayers) {
        liveLayers = JSON.parse(liveLayers);
    }

    const onDelete = () => {
        setLiveLayers([]);
        setLiveLayersId([]);
        localStorage.removeItem("layers");
        localStorage.removeItem("layerIds");
        toast.success("Nueva pizarra creada!");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                onClick={(e) => e.stopPropagation()}
                side={side}
                sideOffset={sideOffset}
                className="w-60 ml-10"
            >
                <ConfirmModal
                    header="Crear nueva pizarra?"
                    description="Esto borrará todo el contenido de la pizarra."
                    onConfirm={onDelete}
                >
                    <Button
                        variant="ghost"
                        className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
                    >
                        <FilePlus2 className="h-4 w-4 mr-2" />
                        Nueva Pizarra
                    </Button>
                </ConfirmModal>
                <ExportDropdownMenu />
                <BackgroundMenu setBackground={setBackground} Background={Background} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
