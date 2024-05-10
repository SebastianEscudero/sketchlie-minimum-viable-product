import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { SheetClose } from "./ui/sheet";

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

const porEquipo: { title: string; href: string }[] = [
    {
        title: "Gestión de producto 🚧",
        href: "https://www.sketchlie.com/gestion-producto/",
    },
    {
        title: "Equipos de Ingeniería 🚧",
        href: "https://www.sketchlie.com/equipos-de-ingenieria/",
    },
    {
        title: "Diseño 🚧",
        href: "https://www.sketchlie.com/diseno/",
    },
    {
        title: "Equipos de IT 🚧",
        href: "https://www.sketchlie.com/equipos-de-it/",
    },
    {
        title: "Marketing 🚧",
        href: "https://www.sketchlie.com/marketing/",
    },
    {
        title: "Agencias y Consultorías 🚧",
        href: "https://www.sketchlie.com/agencias-consultorías/",
    },
    {
        title: "Ventas 🚧",
        href: "https://www.sketchlie.com/ventas/",
    },
]

const Sidebar = ({
}) => {

    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#FFF] overflow-y-auto">
            <div className="py-2 flex-1">
                <div className="flex items-center pl-8">
                    <div className="mr-4">
                        <Image
                            width={75}
                            height={75}
                            alt="Logo"
                            src="/logo.svg"
                        />
                    </div>
                    <h1 className="text-2xl font-semibold">
                        Sketchlie
                    </h1>
                </div>
                <div className="space-y-1 mt-2">
                    <Accordion type="single" collapsible className="text-lg">
                        <AccordionItem value="item-1" className="px-4">
                            <AccordionTrigger className="font-semibold">Producto</AccordionTrigger>
                            <AccordionContent className="flex flex-col w-full gap-1">
                                <SheetClose asChild>
                                    <Link
                                        href="/descripcion"
                                    >
                                        <Button
                                            className='w-full justify-start my-[2px] text-[16px]'
                                            variant={pathname === "/descripcion" ? 'auth' : 'ghost'}
                                        >
                                            Descripcion de Sketchlie 🚧
                                        </Button>
                                    </Link>
                                </SheetClose>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="px-4">
                            <AccordionTrigger className="font-semibold">Soluciones</AccordionTrigger>
                            <AccordionContent className="flex flex-col w-full gap-1">
                                {porCasoDeUso.map((component) => (
                                    <SheetClose asChild key={component.title}>
                                        <Link
                                            href={component.href}
                                        >
                                            <Button
                                                className='w-full justify-start my-[2px] text-[16px]'
                                                variant={pathname === component.href ? 'auth' : 'ghost'}
                                            >
                                                {component.title}
                                            </Button>
                                        </Link>
                                    </SheetClose>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="px-4">
                            <AccordionTrigger className="font-semibold">Equipos</AccordionTrigger>
                            <AccordionContent className="flex flex-col w-full gap-1">
                                {porEquipo.map((component) => (
                                    <SheetClose asChild key={component.title}>
                                        <Link
                                            href={component.href}
                                        >
                                            <Button
                                                className='w-full justify-start my-[2px] text-[16px]'
                                                variant={pathname === component.href ? 'auth' : 'ghost'}
                                            >
                                                {component.title}
                                            </Button>
                                        </Link>
                                    </SheetClose>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <div className="flex flex-col w-full border-b">
                            <SheetClose asChild>
                                <Link
                                    className="my-2 text-lg hover:underline px-5"
                                    href="/blog/"
                                >
                                    <Button
                                        className='w-full justify-start gap-1 text-lg font-semibold'
                                        variant={pathname === "/blog/" ? 'auth' : 'ghost'}
                                    >
                                        Blog
                                    </Button>
                                </Link>
                            </SheetClose>
                        </div>
                    </Accordion>
                </div>
            </div>
            <Link href="https://www.sketchlie.com/auth/register" className="text-center">
                <Button
                    variant="auth"
                    className="w-[90%]"
                >
                    ¿Necesitas Colaborar?
                </Button>
            </Link>
        </div>
    );
}

export default Sidebar;