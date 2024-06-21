import { exportToJPG, exportToPdf, exportToPNG, exportToSVG } from "@/lib/export";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ArrowUpFromLine, ChevronRight } from "lucide-react";

export const ExportDropdownMenu = () => {
    const exportOptions = [
        { label: 'to PDF', action: () => exportToPdf() },
        { label: 'to PNG', action: () => exportToPNG() },
        { label: 'to JPG', action: () => exportToJPG() },
        { label: 'to SVG', action: () => exportToSVG() },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="h-[44px]">
                <DropdownMenuItem className="p-3 cursor-pointer flex justify-between">
                    <div className="flex flex-row items-center">
                        <ArrowUpFromLine className="h-4 w-4 mr-2" />
                        Export
                    </div>
                    <ChevronRight className="h-4 w-4" />
                </DropdownMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" sideOffset={8} className="w-[100px]">
                {exportOptions.map((option, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={option.action}
                        className="p-3 cursor-pointer"
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};