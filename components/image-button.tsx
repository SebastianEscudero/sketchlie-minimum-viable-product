"use client";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { toast } from "sonner"
import { useRef } from "react";

interface ImageButtonProps {
    onImageSelect: (src: string) => void;
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    onClick: () => void;
};

export const ImageButton = ({
    label,
    icon: Icon,
    onClick,
    isActive,
    onImageSelect,
}: ImageButtonProps) => {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const handleButtonClick = () => {
        inputFileRef.current?.click();
        onClick();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length === 0) {
            toast.info("No file selected");
            return
        }
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const fileSizeInMB = file.size / (1024 * 1024); // size in MB

        if (fileSizeInMB > 2) {
            toast.info("Tamaño tiene que ser menor a 2MB");
            return;
        }

        const fileURL = URL.createObjectURL(file);
        onImageSelect(fileURL);
    };

    return (
        <Hint label={label} side="right" sideOffset={14}>
            <Button onClick={handleButtonClick} size="icon" variant={isActive ? "boardActive" : "board"}>
                <Icon />
                <input
                    type="file"
                    onChange={handleUpload}
                    ref={inputFileRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </Button>
        </Hint>
    )
}