"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Hint } from "@/components/hint";

const TabSeparator = () => {
    return(
        <div className="text-black px-1.5">
            |
        </div>
    )
}

export const BottomCanvasLinks = () => {
    return (
        <div className="absolute bottom-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
            <Hint label="Tutorial" side="bottom" sideOffset={10}>
                <Button asChild variant="board" className="px-2 font-bold">
                    <Link href="https://www.sketchlie.com">
                        Ayuda
                    </Link>
                </Button>
            </Hint>
            <TabSeparator />
            <Hint label="¿Quiénes somos?" side="bottom" sideOffset={10}>
                <Button asChild variant="board" className="px-2 font-bold">
                    <Link href="https://www.linkedin.com/company/sketchlie" target="_blank">
                        Sobre nosotros
                    </Link>
                </Button>
            </Hint>
        </div>
    )
}