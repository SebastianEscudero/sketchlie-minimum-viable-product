"use client";

import { toast } from "sonner";
import { ArrowUpFromLine, FilePlus2 } from "lucide-react";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportToPdf } from "@/lib/utils";
import { ConfirmModal } from "./confirm-delete-board";

interface ActionsProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    title?: string;
    setLiveLayers: (layers: any) => void;
    setLiveLayersId: (layersId: string[]) => void;
};

export const Actions = ({
    children,
    side,
    sideOffset,
    title,
    setLiveLayers,
    setLiveLayersId,
}: ActionsProps) => {
    const onDelete = () => {
        setLiveLayers([]);
        setLiveLayersId([]);
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
                className="w-60"
            >
                <ConfirmModal
                    header="Crear nueva pizarra?"
                    description="This will delete the board and all of its contents."
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
                    onClick={() => exportToPdf("prueba")}
                >
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Export to PDF
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
