import { RefreshCcw } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"


export default function TestRefreshButton(){
    const queryClient = useQueryClient()
    return (
      <Button 
      variant={'ghost'}
      onClick={() => {
        toast("Refreshing data")
        localStorage.clear()
        queryClient.invalidateQueries()
      }} >
        <RefreshCcw/>
      </Button>
    )
}