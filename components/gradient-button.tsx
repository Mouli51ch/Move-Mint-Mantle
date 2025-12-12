import { Button } from "@/components/ui/button"
import type React from "react"

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "secondary"
}

export function GradientButton({ children, variant = "primary", className, ...props }: GradientButtonProps) {
  const gradientClass =
    variant === "primary"
      ? "border-2 border-transparent bg-clip-padding bg-gradient-to-r from-neutral-700 to-neutral-500 p-[1px]"
      : "border border-neutral-600"

  return (
    <div className={`${gradientClass} rounded-sm`}>
      <Button
        className={`w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-100 rounded-sm ${className}`}
        {...props}
      >
        {children}
      </Button>
    </div>
  )
}
