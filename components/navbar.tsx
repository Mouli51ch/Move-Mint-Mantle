"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-green-900/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all">
              <span className="text-xs font-bold text-black">MM</span>
            </div>
            <span className="font-medium text-lg text-white">MoveMint</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-green-400 transition">
              How It Works
            </Link>
            <Link href="/features" className="text-sm text-gray-400 hover:text-green-400 transition">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-green-400 transition">
              Pricing
            </Link>
            <Link href="/community" className="text-sm text-gray-400 hover:text-green-400 transition">
              Community
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="#app">
              <Button className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
