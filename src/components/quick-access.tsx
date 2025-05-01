'use client'
import React from "react" // Import React if needed
import {
    UserPlus,
    Package,
    ShoppingCart,
    Settings,
    Fan,
    PackagePlus,
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
import { CreateOrderDialog } from "@/components/dialogs/OrderDialog/create-order-dialog"
import { toast } from "sonner"
import CreateItemForm from "./dialogs/ItemDialog/CreateItem"
import { useIsMobileTEST } from "@/hooks/use-media-query"
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import CustomerModalWrapper from "@/components/dialogs/CustomerDialog/CustomerModalWrapper"

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

    // --- Action Handlers (remain the same) ---
    const toaster = () => {
        toast.warning("Shuffling some card!")
        // Add logic to open customer creation form/modal
    }
    const isMobile = useIsMobileTEST()

    if(isMobile){
        return (
            <Popover modal={true} >
                <PopoverTrigger asChild>
                    <Button
                        aria-label="Quick Actions" // Accessibility improvement
                        size="icon"
                        variant={"ghost"}
                        className={"rounded-lg shadow-lg transition-all duration-300 relative"}

                    >
                        <Fan className="h-12 w-12" /> {/* Always show Plus */}
                        <span className="absolute inset-0 rounded-full bg-white opacity-10 group-hover:opacity-5 transition-opacity duration-300"></span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent 
                    // side="bottom" // Position below the trigger
                    // align="center" // Align center relative to trigger
                    // className="w-64 p-4 z-50 " 
                    className="w-64 p-4 z-50 shadow-md bg-slate-100 border-2 border-slate-200 rounded-lg " // Centered and fixed


>
                    <div className="grid grid-cols-2 gap-4"> {/* Increased gap slightly */}

                        {/* CUSTOMER */}
                        <CustomerModalWrapper>
                            <QuickAction
                                icon={<UserPlus className="h-5 w-5" />}
                                label="Add Customer"
                                color="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200"
                            />
                        </CustomerModalWrapper>

                        {/* ITEM */}
                        <CreateItemForm disableMobileMode={true}>
                            <QuickAction
                                icon={<PackagePlus className="h-5 w-5" />}
                                label="New Item"
                                color="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-200"
                            />
                        </CreateItemForm>

                        {/* ORDER */}
                        <CreateOrderDialog>
                            <QuickAction
                                icon={<ShoppingCart className="h-5 w-5" />}
                                label="New Order"
                                // onClick={handleCreateOrder}
                                color="bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200"
                            />
                        </CreateOrderDialog>

                        {/* OTHER */}
                        <QuickAction
                            icon={<Settings className="h-5 w-5" />}
                            label="Settings"
                            onClick={toaster}
                            color="bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200"
                        />

                    </div>
                </PopoverContent>
            </Popover>
        )
    }


    return (
        // Use HoverCard instead of TooltipProvider/Tooltip
        <HoverCard openDelay={100} closeDelay={150}> {/* Adjust delays as needed */}
            <HoverCardTrigger asChild>
                {/* Main button - styled as requested, now always shows Plus */}
                <Button
                    aria-label="Quick Actions" // Accessibility improvement
                    size="icon"
                    variant={"ghost"}
                    className={"rounded-lg shadow-lg transition-all duration-300 relative"}

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

                    {/* CUSTOMER */}
                    <CustomerModalWrapper>
                        <QuickAction
                            icon={<UserPlus className="h-5 w-5" />}
                            label="Add Customer"
                            color="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200"
                        />
                    </CustomerModalWrapper>

                    {/* ITEM */}
                    <CreateItemForm disableMobileMode={true}>
                        <QuickAction
                            icon={<PackagePlus className="h-5 w-5" />}
                            label="New Item"
                            color="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-200"
                        />
                    </CreateItemForm>

                    {/* ORDER */}
                    <CreateOrderDialog>
                        <QuickAction
                            icon={<ShoppingCart className="h-5 w-5" />}
                            label="New Order"
                            // onClick={handleCreateOrder}
                            color="bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200"
                        />
                    </CreateOrderDialog>

                    {/* OTHER */}
                    <QuickAction
                        icon={<Settings className="h-5 w-5" />}
                        label="Settings"
                        onClick={toaster}
                        color="bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200"
                    />

                </div>
            </HoverCardContent>
        </HoverCard>
    )
}