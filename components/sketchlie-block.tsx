"use client"

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "./ui/dropdown-menu";
import { Check, Users, Share2, Clock, Zap, ImageIcon, ArrowRight, Building2 } from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

const benefits = [
    {
        label: "Compartir tableros",
        icon: Share2,
        color: "text-red-500",
        bgColor: "bg-red-100",
    },
    {
        label: "Invitar Compañeros",
        icon: Users,
        color: "text-blue-500",
        bgColor: "bg-blue-100",
    },
    {
        label: "Haz una organización",
        icon: Building2,
        color: "text-green-500",
        bgColor: "bg-green-100",
    },
    {
        label: "Colaboración en Tiempo Real",
        icon: Clock,
        color: "text-yellow-500",
        bgColor: "bg-yellow-100",
    },
    {
        label: "Sube Imágenes",
        icon: ImageIcon,
        color: "text-indigo-500",
        bgColor: "bg-indigo-100",
    },
    {
        label: "Mejor rendimiento",
        icon: Zap,
        color: "text-purple-500",
        bgColor: "bg-purple-100",
    },
]

export const SketchlieBlock = () => {
    return (
        <div className="absolute top-2 right-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
            <div className="flex items-center">
                <DropdownMenu>
                    <Button asChild variant="board" className="px-2">
                        <DropdownMenuTrigger className="flex outline-none">
                            <p className="font-bold px-2">Compartir</p>
                            <Users className="h-5 w-5 fill-[#2E4DE6] text-[#2E4DE6]"/>  
                        </DropdownMenuTrigger>
                    </Button>
                    <DropdownMenuContent align="end" className="px-3 py-2 ">
                        <div className="flex flex-col space-y-3">
                            <p className="font-bold text-xl text-center pt-1">¿Necesitas colaborar?</p>
                            <div className="text-lg space-y-2">
                                {benefits.map((benefit) => (
                                    <Card
                                        key={benefit.label}
                                        className="p-3 border-black-5 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-x-4">
                                            <div className={cn("p-2 w-fit rounded-md", benefit.bgColor)}>
                                                <benefit.icon className={cn("w-6 h-6", benefit.color)} />
                                            </div>
                                            <div className="font-semibold text-sm">
                                                {benefit.label}
                                            </div>
                                        </div>
                                        <Check className="text-custom-blue w-5 h-5 ml-2"/>
                                    </Card>
                                ))}
                            </div>
                        </div>
                        <Button
                            size="lg"
                            variant="auth"
                            className="w-full mt-2 text-[16px]"
                        >
                            <Link href="https://www.sketchlie.com/auth/register" className="flex items-center justify-center" target="_blank">
                                Empieza a colaborar hoy
                                <ArrowRight className="w-5 h-5 ml-2"/>
                            </Link>
                        </Button>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}