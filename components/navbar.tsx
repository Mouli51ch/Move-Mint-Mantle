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
            <img 
              src="https://ik.imagekit.io/0whwkbkhd/Black%20and%20White%20Illustrative%20Street%20Dance%20Logo.png" 
              alt="MoveMint Logo" 
              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200"
            />
            <span className="font-medium text-lg text-white">MoveMint</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/marketplace" className="text-sm text-gray-400 hover:text-green-400 transition">
              Marketplace
            </Link>
            <Link href="/app/cashflow" className="text-sm text-gray-400 hover:text-green-400 transition">
              Cashflow Protocol
            </Link>
            <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-green-400 transition">
              How It Works
            </Link>
            <Link href="/features" className="text-sm text-gray-400 hover:text-green-400 transition">
              Features
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
