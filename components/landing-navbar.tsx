"use client";

import Image from "next/image";
import Link from "next/link";
import { NavigationMenuLanding } from "./navigation-menu";
import { MobileSidebar } from "./mobile-sidebar";
import { Button } from "./ui/button";

export const LandingNavbar = () => {
    return (
        <nav className="py-3 bg-[#FFFFFF] border-b border-zinc-600 sticky top-0 z-50">
            <div className="flex items-center justify-between xl:mx-[10%] lg:mx-[7%] md:mx-[5%] mx-[3%]">
                <div className="flex items-center">
                    <MobileSidebar />
                    <Link href="https://www.sketchlie.com/" className="flex items-center mr-2 ml-2">
                        <div className="mr-4">
                            <Image
                                height={65}
                                width={65}
                                alt="Logo"
                                src="/logo.svg"    
                            />
                        </div>
                        <p className="text-2xl font-bold text-[#38322C] font-roobert">
                            Sketchlie
                        </p>
                    </Link>
                    <NavigationMenuLanding />
                </div>
                <div className="items-center gap-x-2">
                    <Link href="https://www.sketchlie.com/auth/register">
                        <Button variant="auth" className="rounded-lg">
                            ¿Necesitas Colaborar?
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}