import { 
  Package2, 
  ShoppingCart, 
  ArrowLeftRight, 
  Truck, 
  Users, 
  Forklift
} from 'lucide-react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const menuItems = [
  { title: 'Items', icon: Package2, path: '/warehouse/items', active: true },
  { title: 'Orders', icon: ShoppingCart, path: '/warehouse/orders', active: true },
  { title: 'Item Transactions', icon: ArrowLeftRight, path: '/warehouse/transactions', active: false },
  { title: 'Forklift', icon: Forklift, path: '/warehouse/forklift', active: false },
  { title: 'Labour', icon: Users, path: '/warehouse/labour', active: false },
  { title: 'Deliveries', icon: Truck, path: '/warehouse/Deliveries', active: false },
] as const;

export default function WarehousePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Warehouse Management
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menuItems.map(({ title, icon: Icon, path, active }) => (
          <TooltipProvider key={title}>
            <Tooltip>
              <TooltipTrigger asChild>
                {active ? (
                  <Link href={path}>
                    <Card className={cn(
                      "p-6 text-center transition-all duration-200",
                      "hover:translate-y-[-4px] hover:shadow-lg",
                      "flex flex-col items-center justify-center h-[200px]",
                    )}>
                      <div className="text-primary mb-4">
                        <Icon size={48} strokeWidth={1.5} />
                      </div>
                      <h2 className="text-xl font-semibold">
                        {title}
                      </h2>
                    </Card>
                  </Link>
                ) : (
                  <div className={cn(
                    "p-6 text-center transition-all duration-200",
                    "hover:translate-y-[-4px] hover:shadow-lg",
                    "flex flex-col items-center justify-center h-[200px]",
                    "opacity-75 cursor-not-allowed"
                  )}>
                    <Card className="p-6 w-full h-full flex flex-col items-center justify-center">
                      <div className="text-primary mb-4">
                        <Icon size={48} strokeWidth={1.5} />
                      </div>
                      <h2 className="text-xl font-semibold">
                        {title}
                      </h2>
                    </Card>
                  </div>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>{active ? 'Click to manage items' : 'Coming Soon'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
