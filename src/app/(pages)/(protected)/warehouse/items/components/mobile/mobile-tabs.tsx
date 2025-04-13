"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MobileTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  availableItemTypes: string[]
}

export function MobileTabs({ activeTab, setActiveTab, availableItemTypes }: MobileTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-0 bg-red-400">
      <div className=" overflow-x-auto">
        <TabsList className="w-full justify-start mb-0 overflow-x-auto">
          <TabsTrigger value="all" className="px-3">
            All
          </TabsTrigger>
          <TabsTrigger value="out-of-stock" className="px-3">
            Out of Stock
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="px-3">
            Low Stock
          </TabsTrigger>
          {availableItemTypes.map((type) => (
            <TabsTrigger key={type} value={type} className="px-3">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}

