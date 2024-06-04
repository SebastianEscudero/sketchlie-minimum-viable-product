"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"

const porEquipo: { title: string; href: string }[] = [
    {
        title: "Gestión de producto 🚧",
        href: "https://www.sketchlie.com/gestion-producto",
    },
    {
        title: "Equipos de Ingeniería 🚧",
        href: "https://www.sketchlie.com/equipos-de-ingenieria",
    },
    {
        title: "Diseño",
        href: "https://www.sketchlie.com/diseno/",
    },
    {
        title: "Equipos de IT 🚧",
        href: "https://www.sketchlie.com/equipos-de-it",
    },
    {
        title: "Marketing 🚧",
        href: "https://www.sketchlie.com/marketing",
    },
    {
        title: "Agencias y Consultorías 🚧",
        href: "https://www.sketchlie.com/agencias-consultorías",
    },
    {
        title: "Ventas 🚧",
        href: "https://www.sketchlie.com/ventas",
    },
]

const porCasoDeUso: { title: string; href: string }[] = [
    {
        title: "Pizarra Online",
        href: "https://www.sketchlie.com/pizarra-online/",
    },
    {
        title: "Mapa Conceptual",
        href: "https://www.sketchlie.com/mapa-conceptual/",
    },
    {
        title: "Diagrama de Flujo",
        href: "https://www.sketchlie.com/diagrama-de-flujo/",
    },
    {
        title: "Wireframe",
        href: "https://www.sketchlie.com/wireframe/",
    },
    {
        title: "Mapas mentales",
        href: "https://www.sketchlie.com/mapa-mental-online/",
    },
    {
        title: "Mapa de procesos",
        href: "https://www.sketchlie.com/mapas-de-procesos",
    },
    {
        title: "Diagramas",
        href: "https://www.sketchlie.com/diagrama/",
    },
    {
        title: "Lluvia de ideas ",
        href: "https://www.sketchlie.com/lluvia-de-ideas/",
    },
    {
        title: "Customer Journey Map ",
        href: "https://www.sketchlie.com/customer-journey-map/",
    },
]

const Recursos = [
    {
        title: "Plantillas",
        href: "https://www.sketchlie.com/plantillas/",
    },
    {
        title: "Blog",
        href: "https://www.sketchlie.com/blog/",
    },
    {
        title: "Tutorial de Sketchlie",
        href: "https://www.sketchlie.com/blog/pizarra-online-tutorial/",
    }
]

export function NavigationMenuLanding() {

    const pathname = usePathname();

    return (
        <div className="gap-x-2 flex flex-row">
            <NavigationMenu className="hidden lg:flex lg:flex-col">
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>¿Qué es Sketchlie</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="grid w-[400px] p-6 md:w-[500px] lg:w-[300px]">
                                <p className="px-3 text-base mb-2 text-neutral-600 font-semibold">Producto</p>
                                <NavigationMenuLink
                                    href={"/descripcion"}
                                >
                                    <Button
                                        className='w-full justify-start my-[3px] text-base'
                                        variant={pathname === "/descripcion" ? 'auth' : 'ghost'}
                                    >
                                        Descripcion de Sketchlie 🚧
                                    </Button>
                                </NavigationMenuLink>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <NavigationMenu className="hidden lg:flex lg:flex-col">
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Soluciones</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="grid w-[400px] p-6 md:w-[500px] md:grid-cols-2 lg:w-[600px] gap-x-2">
                                <div>
                                    <p className="px-3 text-base mb-2 text-neutral-600 font-semibold">Equipos</p>
                                    {porEquipo.map((component) => (
                                        <NavigationMenuLink
                                            key={component.title}
                                            href={component.href}
                                        >
                                            <Button
                                                className='w-full justify-start my-[3px] text-base'
                                                variant={pathname === component.href ? 'auth' : 'ghost'}
                                            >
                                                {component.title}
                                            </Button>
                                        </NavigationMenuLink>
                                    ))}
                                </div>
                                <div>
                                    <p className="px-3 text-base mb-2 text-neutral-600 font-semibold">Casos de uso</p>
                                    {porCasoDeUso.map((component) => (
                                        <NavigationMenuLink
                                            key={component.title}
                                            href={component.href}
                                        >
                                            <Button
                                                className='w-full justify-start my-[3px] text-base'
                                                variant={pathname === component.href ? 'auth' : 'ghost'}
                                            >
                                                {component.title}
                                            </Button>
                                        </NavigationMenuLink>
                                    ))}
                                </div>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <NavigationMenu className="hidden lg:flex lg:flex-col">
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="p-6 md:w-[500px] lg:w-[300px] flex flex-col">
                                <p className="px-3 text-base mb-2 text-neutral-600 font-semibold">Recursos</p>
                                {Recursos.map((recurso) => (
                                    <NavigationMenuLink
                                        key={recurso.title}
                                        href={recurso.href}
                                    >
                                        <Button
                                            className='justify-start my-[3px] text-base mr-2 w-full'
                                            variant={pathname === recurso.href ? 'auth' : 'ghost'}
                                        >
                                            {recurso.title}
                                        </Button>
                                    </NavigationMenuLink>
                                ))}
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <Link
                href="/pricing/"
            >
                <Button
                    className='justify-start my-[3px] text-base hidden lg:flex'
                    variant={pathname === "/pricing/" ? 'auth' : 'ghost'}
                >
                    Precios
                </Button>
            </Link>
        </div>
    )
}