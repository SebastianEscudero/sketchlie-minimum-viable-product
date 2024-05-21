"use client";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ToolButtonProps {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
};

export const ToolButton = ({
    label,
    icon: Icon,
    onClick,
    isActive,
    isDisabled
}: ToolButtonProps) => {
    let side: "right" | "top" | "bottom" | "left" | undefined = "right";
    if (window.innerHeight < 545) {
        side = "top";
    }

    return (
        <Hint label={label} side={side} sideOffset={14}>
            <Button disabled={isDisabled} onClick={onClick} className="h-10 w-10 p-2" variant={isActive ? "boardActive" : "board"}>
                <Icon className="h-5 w-5" />
            </Button>
        </Hint>
    )
}