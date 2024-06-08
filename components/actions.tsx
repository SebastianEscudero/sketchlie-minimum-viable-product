"use client";

import { toast } from "sonner";
import { ArrowUpFromLine, Check, ChevronRight, Eye, FilePlus2 } from "lucide-react";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportToPNG } from "@/lib/utils";
import { ConfirmModal } from "./confirm-delete-board";

interface ActionsProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    setLiveLayers: (layers: any) => void;
    setLiveLayersId: (layersId: string[]) => void;
    setIsBackgroundGridVisible: (isVisible: boolean) => void;
    isBackgroundGridVisible: boolean;
};

export const Actions = ({
    children,
    side,
    sideOffset,
    setLiveLayers,
    setLiveLayersId,
    setIsBackgroundGridVisible,
    isBackgroundGridVisible,
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="p-3 cursor-pointer text-sm w-full justify-start font-semibold"
                        >
                            <div className="flex flex-row items-center">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </div>
                            <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" sideOffset={10}>
                        <Button
                            variant="ghost"
                            className="p-3 cursor-pointer text-sm w-full justify-start font-semibold"
                            onClick={() => {
                                setIsBackgroundGridVisible(!isBackgroundGridVisible)
                                localStorage.setItem("isBackgroundGridVisible", JSON.stringify(!isBackgroundGridVisible))
                            }}
                        >
                            {isBackgroundGridVisible && (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            Show Grid
                        </Button>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ConfirmModal
                    header="Crear nueva pizarra?"
                    description="Esto borrará todo el contenido de la pizarra."
                    onConfirm={onDelete}
                >
                    <Button
                        variant="ghost"
                        className="p-3 cursor-pointer text-sm w-full justify-start font-semibold"
                    >
                        <FilePlus2 className="h-4 w-4 mr-2" />
                        Nueva Pizarra
                    </Button>
                </ConfirmModal>
                <Button
                    variant="ghost"
                    className="p-3 cursor-pointer text-sm w-full justify-start font-semibold"
                    onClick={() => exportToPNG()}
                >
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Export to PNG
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
