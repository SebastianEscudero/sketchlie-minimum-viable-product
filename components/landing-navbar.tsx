"use client";

import Image from "next/image";
import Link from "next/link";
import { NavigationMenuLanding } from "./navigation-menu";
import { MobileSidebar } from "./mobile-sidebar";
import { Button } from "./ui/button";

export const LandingNavbar = () => {
    return (
        <nav className="py-3 bg-[#FFFFFF] border-b border-zinc-600 sticky top-0 z-50 h-[71px]">
            <div className="flex items-center justify-between xl:mx-[5%] lg:mx-[3%] md:mx-[2%] mx-[1%] h-[40px]">
                <div className="flex items-center">
                    <MobileSidebar />
                    <Link href="https://www.sketchlie.com/" className="flex items-center mr-2 ml-2" title="Sketchlie">
                        <div className="mr-4 h-full w-full">
                            <Image
                                height={65}
                                width={65}
                                alt="Sketchlie"
                                src="/logo.svg"    
                                loading="lazy"
                            />
                        </div>
                        <p className="text-2xl font-bold text-[#38322C] font-roobert">
                            Sketchlie
                        </p>
                    </Link>
                    <NavigationMenuLanding />
                </div>
                <div className="hidden sm:flex items-center gap-x-2">
                    <Link href="/tablero/" title="Ir a tablero">
                        <Button variant="auth" className="rounded-lg">
                            Ir a tablero
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}