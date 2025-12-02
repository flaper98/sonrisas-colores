"use client"

import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
      <header className="bg-white border-b border-border shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">

          {/* Left section */}
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Image
                src="/logo.png"
                alt="Sonrisas y Colores Kids"
                width={42}
                height={42}
                className="rounded-full shadow-md"
            />

            {/* Titles */}
            <div className="hidden sm:flex flex-col leading-tight select-none">
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Sonrisas y Colores Kids
            </span>

              <span className="text-[11px] font-medium text-gray-500">
              Sistema de Gestión de Alquileres
            </span>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="lg:hidden hover:bg-purple-50"
                aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-purple-600" />
            </Button>
          </div>
        </div>

        {/* Decorative gradient line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />
      </header>
  )
}
