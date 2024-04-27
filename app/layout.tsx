import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pizarraonline.com"),
  title: "Pizarra Online Gratis | Sketchlie",
  description: "Sketchlie es la pizarra online en tiempo real real más rápida para tu equipo. visualiza en móvil, tableta o computadora de escritorio. Sin registros, sin instalaciones.",
  keywords: ["pizarra online", "pizarra virtual", "pizarra online gratis", "pizarra en linea", "pizarra virtual gratis"],
  alternates: {
    canonical: "https://www.pizarraonline.com",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/public/favicon/favicon.ico",
    apple: "/public/favicon/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}