import type React from "react"
import { cn } from "@/lib/utils"

interface SelectionButtonProps {
  value: string
  selected: boolean
  onClick: () => void
  color: "green" | "red" | "blue"
  children: React.ReactNode
}

export function SelectionButton({ value, selected, onClick, color, children }: SelectionButtonProps) {
  const baseClasses = "px-4 py-2 rounded-full font-medium transition-all duration-200 ease-in-out"
  const colorClasses = {
    green: "bg-green-100 text-green-700 hover:bg-green-200",
    red: "bg-red-100 text-red-700 hover:bg-red-200",
    blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  }
  const selectedClasses = {
    green: "bg-green-500 text-white hover:bg-green-600",
    red: "bg-red-500 text-white hover:bg-red-600",
    blue: "bg-blue-500 text-white hover:bg-blue-600",
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn( baseClasses, selected ? selectedClasses[color] : colorClasses[color])}
    >
      {children}
    </button>
  )
}
