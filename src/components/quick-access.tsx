
// "use client"

// import { useState, useEffect } from "react"
// import {
//     Plus,
//     UserPlus,
//     Package,
//     ShoppingCart,
//     Settings,
//     X
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { cn } from "@/lib/utils"
// import { useToast } from "@/hooks/use-toast"
// import { motion, AnimatePresence } from "framer-motion"

// interface QuickActionProps {
//     icon: React.ReactNode
//     label: string
//     onClick: () => void
//     className?: string
//     color?: string
// }

// const QuickAction = ({
//     icon,
//     label,
//     onClick,
//     className,
//     color = "bg-secondary hover:bg-secondary/90"
// }: QuickActionProps) => {
//     return (
//         <Button
//             variant="outline"
//             className={cn(
//                 "flex flex-col h-24 w-24 rounded-lg shadow-md transition-all duration-200 gap-2 p-2",
//                 color,
//                 className
//             )}
//             onClick={onClick}
//         >
//             <div className="rounded-full bg-background p-2">{icon}</div>
//             <span className="text-xs font-medium">{label}</span>
//         </Button>
//     )
// }

// export function QuickAccess() {
//     const [ isOpen, setIsOpen ] = useState(false)
//     const { toast } = useToast()

//     // Close the menu when user clicks elsewhere
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (isOpen && !(event.target as Element).closest('.quick-access-zone')) {
//                 setIsOpen(false)
//             }
//         }

//         document.addEventListener('mousedown', handleClickOutside)
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside)
//         }
//     }, [ isOpen ])

//     const handleCreateCustomer = () => {
//         toast({
//             title: "Customer Creation",
//             description: "Customer creation modal would open here",
//         })
//         // Add your logic to open customer creation form/modal
//     }

//     const handleCreateItem = () => {
//         toast({
//             title: "Item Creation",
//             description: "Item creation modal would open here",
//         })
//         // Add your logic to open item creation form/modal
//     }

//     const handleCreateOrder = () => {
//         toast({
//             title: "Order Creation",
//             description: "Order creation modal would open here",
//         })
//         // Add your logic to open order creation form/modal
//     }

//     const handleSettings = () => {
//         toast({
//             title: "Settings",
//             description: "Settings panel would open here",
//         })
//         // Add your logic to open settings panel
//     }

//     return (
//         <div className="">
//             <div
//                 className="relative"
//                 onMouseEnter={() => setIsOpen(true)}
//                 onMouseLeave={() => setIsOpen(false)}
//             >
//                 {/* Main button */}
//                 <motion.div
//                     whileTap={{ scale: 0.9 }}
//                     animate={{ rotate: isOpen ? 45 : 0 }}
//                     transition={{ duration: 0.2 }}
//                 >
//                     <Button
//                         size="icon"
//                         className={cn(
//                             "h-14 w-14 rounded-full shadow-lg transition-all duration-300 relative",
//                             isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90",
//                         )}
//                         onClick={() => setIsOpen(!isOpen)}
//                     >
//                         {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
//                         <span className="absolute inset-0 rounded-full bg-white opacity-10 hover:opacity-0 transition-opacity duration-300"></span>
//                     </Button>
//                 </motion.div>

//                 {/* Quick actions */}
//                 <AnimatePresence>
//                     {isOpen && (
//                         <motion.div
//                             initial={{ opacity: 0, scale: 0.9 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             exit={{ opacity: 0, scale: 0.9 }}
//                             transition={{ duration: 0.2 }}
//                             className="absolute top-16 right-0 bg-card rounded-lg shadow-xl border p-4 w-60"
//                         >
//                             <div className="grid grid-cols-2 gap-3">
//                                 <QuickAction
//                                     icon={<UserPlus className="h-5 w-5" />}
//                                     label="Add Customer"
//                                     onClick={handleCreateCustomer}
//                                     color="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200"
//                                 />
//                                 <QuickAction
//                                     icon={<Package className="h-5 w-5" />}
//                                     label="New Item"
//                                     onClick={handleCreateItem}
//                                     color="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-200"
//                                 />
//                                 <QuickAction
//                                     icon={<ShoppingCart className="h-5 w-5" />}
//                                     label="New Order"
//                                     onClick={handleCreateOrder}
//                                     color="bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200"
//                                 />
//                                 <QuickAction
//                                     icon={<Settings className="h-5 w-5" />}
//                                     label="Settings"
//                                     onClick={handleSettings}
//                                     color="bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200"
//                                 />
//                             </div>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//             </div>
//         </div>
//     )
// }"use client"

import React from "react" // Import React if needed
import {
    Plus,
    UserPlus,
    Package,
    ShoppingCart,
    Settings,
    Fan,
    // Removed X as we won't toggle the icon with hover state
} from "lucide-react"
import { Button } from "@/components/ui/button"
// Import HoverCard components instead of Tooltip
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast" // Assuming this path is correct
import { CreateOrderDialog } from "@/app/(pages)/(protected)/warehouse/orders/components/order-form/create-order-dialog"

// QuickAction component remains the same - no changes needed here
interface QuickActionProps {
    icon: React.ReactNode
    label: string
    onClick?: () => void
    className?: string
    color?: string
}

const QuickAction = ({
    icon,
    label,
    onClick,
    className,
    color = "bg-secondary hover:bg-secondary/90"
}: QuickActionProps) => {
    return (
        <Button
            variant="outline"
            className={cn(
                "flex flex-col h-24 w-24 rounded-lg shadow-md transition-all duration-200 gap-2 p-2 justify-center items-center", // Added justify/items-center
                color,
                className
            )}
            onClick={onClick}
        >
            {/* Consider consistent icon sizing */}
            <div className="rounded-full bg-background p-2">{icon}</div>
            <span className="text-xs font-medium text-center">{label}</span> {/* Added text-center */}
        </Button>
    )
}


export function QuickAccess() {
    // No longer need useState for isOpen
    const { toast } = useToast()

    // --- Action Handlers (remain the same) ---
    const handleCreateCustomer = () => {
        toast({
            title: "Customer Creation",
            description: "Customer creation modal would open here",
        })
        // Add logic to open customer creation form/modal
    }

    const handleCreateItem = () => {
        toast({
            title: "Item Creation",
            description: "Item creation modal would open here",
        })
        // Add logic to open item creation form/modal
    }

    const handleCreateOrder = () => {
        toast({
            title: "Order Creation",
            description: "Order creation modal would open here",
        })
        // Add logic to open order creation form/modal
    }

    const handleSettings = () => {
        toast({
            title: "Settings",
            description: "Settings panel would open here",
        })
        // Add logic to open settings panel
    }
    // --- End Action Handlers ---


    return (
        // Use HoverCard instead of TooltipProvider/Tooltip
        <HoverCard openDelay={100} closeDelay={150}> {/* Adjust delays as needed */}
            <HoverCardTrigger asChild>
                {/* Main button - styled as requested, now always shows Plus */}
                <Button
                    aria-label="Quick Actions" // Accessibility improvement
                    size="icon"
                    variant={"ghost"}
                    className={cn(
                        " rounded-lg shadow-lg transition-all duration-300 relative",
                        // "bg-primary hover:bg-primary/90", // Always primary color
                        // No more conditional destructive background
                    )}
                // No onClick needed here for hover interaction
                >
                    {/* <Plus className="h-6 w-6" /> Always show Plus */}
                    <Fan className="h-12 w-12" /> {/* Always show Plus */}
                    {/* Optional: Subtle animation effect */}
                    <span className="absolute inset-0 rounded-full bg-white opacity-10 group-hover:opacity-5 transition-opacity duration-300"></span>
                </Button>
            </HoverCardTrigger>

            {/* HoverCardContent holds the actions grid */}
            <HoverCardContent
                side="bottom" // Position below the trigger
                align="center" // Align center relative to trigger
                className="w-64 p-4" // Adjusted width and padding
            // No need for pointer leave handlers here, HoverCard manages it
            >
                <div className="grid grid-cols-2 gap-4"> {/* Increased gap slightly */}

                    <QuickAction
                        icon={<UserPlus className="h-5 w-5" />}
                        label="Add Customer"
                        onClick={handleCreateCustomer}
                        color="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200"
                    />
                    <QuickAction
                        icon={<Package className="h-5 w-5" />}
                        label="New Item"
                        onClick={handleCreateItem}
                        color="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-200"
                    />
                    <CreateOrderDialog>
                        <QuickAction
                            icon={<ShoppingCart className="h-5 w-5" />}
                            label="New Order"
                            // onClick={handleCreateOrder}
                            color="bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200"
                        />
                    </CreateOrderDialog>

                    <QuickAction
                        icon={<Settings className="h-5 w-5" />}
                        label="Settings"
                        onClick={handleSettings}
                        color="bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200"
                    />
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}