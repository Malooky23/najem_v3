import CreateItemForm from "../../CreateItem"
import { Button } from "@/components/ui/button"
import { GitCompareArrowsIcon, Home, List, ListFilter, Plus, Search, Settings, UserCog2 } from "lucide-react"
import Link from "next/link"
// import { useRouter } from "next/navigation"

export function MobileBottomNav() {
  // const router = useRouter()
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-10 pb-2">
      <div className="flex justify-around items-center h-16">

        <Link href="/warehouse" className="flex flex-col h-full rounded-none flex-1 items-center justify-center"
        // onClick={() => router.push("/warehouse")}
        >

          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>

        </Link>

        <Link href="/warehouse/orders" className="flex flex-col h-full rounded-none flex-1 items-center justify-center "
        // onClick={() => router.push("/warehouse/orders")}
        >
          <List className="h-5 w-5"  />
          <span className="text-xs mt-1">Orders</span>
        </Link>
        {/* <Button className="h-12 w-12 rounded-full absolute -top-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <Plus className="h-6 w-6" />
        </Button> */}
        <CreateItemForm />
        <div className="flex-1" /> {/* Spacer */}
        <Link href="/customers" className="flex flex-col h-full rounded-none flex-1 items-center justify-center">
          <UserCog2 className="h-5 w-5" />
          <span className="text-xs mt-1">Customers</span>
        </Link>
        <Link href="/warehouse/tx" className="flex flex-col h-full rounded-none flex-1 items-center justify-center">
          <GitCompareArrowsIcon className="h-5 w-5" />
          <span className="text-xs mt-1"> Movements</span>
        </Link>
      </div>
    </div>
  )
}

