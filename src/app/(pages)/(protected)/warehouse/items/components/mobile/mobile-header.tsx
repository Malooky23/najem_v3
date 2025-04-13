import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

interface MobileHeaderProps {
  onSearchClick?: () => void;
  onFilterClick?: () => void;
}

export function MobileHeader({ onSearchClick, onFilterClick }: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-30 w-full bg-background border-b">
      <div className="flex items-center justify-between p-4 w-full">
        <h1 className="text-xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            id="search-trigger" 
            onClick={onSearchClick}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            id="filter-trigger" 
            onClick={onFilterClick}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

