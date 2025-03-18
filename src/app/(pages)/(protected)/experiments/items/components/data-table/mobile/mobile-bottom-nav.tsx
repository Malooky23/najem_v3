import CreateItemForm from "@/app/(pages)/(protected)/warehouse/items/components/CreateItem"
import { Button } from "@/components/ui/button"
import { Home, ListFilter, Plus, Search, Settings } from "lucide-react"

export function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-10 pb-2">
      <div className="flex justify-around items-center h-16">
        <Button variant="ghost" className="flex flex-col h-full rounded-none flex-1 items-center justify-center">
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Button>
        <Button variant="ghost" className="flex flex-col h-full rounded-none flex-1 items-center justify-center">
          <ListFilter className="h-5 w-5" />
          <span className="text-xs mt-1">Inventory</span>
        </Button>
        {/* <Button className="h-12 w-12 rounded-full absolute -top-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <Plus className="h-6 w-6" />
        </Button> */}
        <CreateItemForm/>
        <div className="flex-1" /> {/* Spacer */}
        <Button variant="ghost" className="flex flex-col h-full rounded-none flex-1 items-center justify-center">
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </Button>
        <Button variant="ghost" className="flex flex-col h-full rounded-none flex-1 items-center justify-center">
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </Button>
      </div>
    </div>
  )
}

