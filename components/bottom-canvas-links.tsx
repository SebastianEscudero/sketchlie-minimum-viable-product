"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Hint } from "@/components/hint";
import { ChevronsUp, CircleHelp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const TabSeparator = () => {
    return(
        <div className="text-black px-1.5">
            |
        </div>
    )
}

export const BottomCanvasLinks = () => {
    return (
        <div className="absolute bottom-2 left-2 bg-white rounded-md p-1.5 h-[30px] flex items-center shadow-md">
            <Hint label="Tutorial" side="bottom" sideOffset={10}>
                <Link href="https://www.sketchlie.com/blog/pizarra-online-tutorial/" target="_blank">
                    <CircleHelp className="h-4 w-4"/>
                </Link>
            </Hint>
            <TabSeparator />
            <DropdownMenu>
                <Hint label="¿Quiénes somos?" side="bottom" sideOffset={10}>
                    <DropdownMenuTrigger className="flex outline-none">
                        <ChevronsUp className="w-4 h-4"/>
                    </DropdownMenuTrigger>
                </Hint>
                <DropdownMenuContent align="start" className="px-3 py-2 font-semibold space-y-1">
                    <DropdownMenuItem>
                        <Link href="https://www.sketchlie.com/" target="_blank">
                            Website
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="https://www.twitter.com/sketchlieteam/" target="_blank">
                            Twitter
                        </Link> 
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="https://www.linkedin.com/company/sketchlie/" target="_blank">
                            Linkedin
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="https://www.instagram.com/sketchlieux/" target="_blank">
                            Instagram
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="https://www.facebook.com/people/Sketchlie/61558420300592/" target="_blank">
                            Facebook
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}