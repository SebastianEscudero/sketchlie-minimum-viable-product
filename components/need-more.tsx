"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Check, Users, Share2, UploadCloud, Clock, Zap, ImageIcon, ArrowRight, Building2 } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface NeedMoreProps {
    isOpen: boolean;
    onClose: () => void;
}

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

export const NeedMore = ({ isOpen, onClose }: NeedMoreProps) => {
    return (
        <div>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-full overflow-y-auto h-full max-h-[610px] my-3">
                    <DialogHeader>
                        <div className="flex items-center justify-center">
                            <Button variant="board" className="p-6">
                                <Link href="https://www.sketchlie.com" className="flex items-center justify-center">
                                    <Image 
                                        src="/logo.svg"
                                        alt="Board logo"
                                        height={80}
                                        width={80}
                                    />
                                    <span className="font-semibold text-4xl ml-2 text-black">
                                        Sketchlie
                                    </span>
                                </Link>
                            </Button>
                        </div>
                        <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
                            {benefits.map((benefit) => (
                                <Card
                                    key={benefit.label}
                                    className="p-3 border-black-5 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-x-4">
                                        <div className={cn("p-2 w-fit rounded-md", benefit.bgColor)}>
                                            <benefit.icon className={cn("w-6 h-6", benefit.color)} />
                                        </div>
                                        <div className="font-semibold text-[16px]">
                                            {benefit.label}
                                        </div>
                                    </div>
                                    <Check className="text-custom-blue w-5 h-5"/>
                                </Card>
                            ))}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            size="lg"
                            variant="auth"
                            className="w-full text-lg"
                        >
                            <Link href="https://www.sketchlie.com/auth/register" className="flex items-center justify-center">
                                Crea un tablero gratis
                                <ArrowRight className="w-5 h-5 ml-2"/>
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}