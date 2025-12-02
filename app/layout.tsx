import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Reemplazo de Geist por Inter
const inter = Inter({ subsets: ["latin"] });

// Reemplazo de Geist_Mono por JetBrains Mono
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sonrisas y Colores Kids - Gestión de Alquileres",
  description: "Sistema de administración de alquileres para Sonrisas y Colores Kids",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="es" className={`${inter.className}`}>
      <body className="font-sans antialiased">
      {children}
      <Analytics />
      </body>
      </html>
  );
}
