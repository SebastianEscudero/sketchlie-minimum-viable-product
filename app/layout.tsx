import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pizarraonline.com"),
  title: "Pizarra Online Gratis | Sketchlie",
  description: "Pizarra Online es la pizarra en linea más rápida y fácil de usar. Sin registro y sin descargas, hecha para dibujar y compartir ideas en tiempo real. Pruébala gratis",
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

  const structuredData = {
    "@context" : "https://schema.org",
    "@type" : "WebSite",
    "name" : "Pizarra Online",
    "url" : metadata.alternates?.canonical
  };

  return (
    <html lang="es">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className={inter.className}>
        <h1 className="hidden">
          Pizarra Online Gratis | Sketchlie
        </h1>
        <Toaster />
        {children}
      </body>
    </html>
  );
}