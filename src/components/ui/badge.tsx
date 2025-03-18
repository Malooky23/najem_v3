import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { itemTypes } from "@/types/items"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        warning:
          "border-transparent bg-amber-500 text-white shadow hover:bg-amber-600",
        success:
          "border-transparent bg-emerald-500 text-white shadow hover:bg-emerald-600",
        info:
          "border-transparent bg-blue-500 text-white shadow hover:bg-blue-600",
        CARTON: "border-transparent bg-blue-500/20 text-blue-700", // as type of itemTypes
        BOX: "border-transparent bg-green-500/20 text-green-700",
        SACK: "border-transparent bg-purple-500/20 text-purple-700",
        EQUIPMENT: "border-transparent bg-orange-500/20 text-orange-700",
        PALLET: "border-transparent bg-yellow-100 text-yellow-800",
        CAR: "border-transparent bg-amber-900/30 text-gray-700",
        OTHER: "border-transparent bg-pink-500/20 text-gray-700",
        null:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

