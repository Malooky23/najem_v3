import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  onClick: () => Promise<void>
  showLabel?: boolean
}

export function SaveButton({ onClick, showLabel = false }: SaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      await onClick()
    } catch (error) {
      setHasError(true)
      // Add shake animation on error
      setTimeout(() => setHasError(false), 1000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      className={cn(
        "gap-2 transition-all duration-200 relative",
        isLoading && "text-transparent",
        hasError ? "bg-red-500 hover:bg-red-600 animate-shake" : "bg-green-500 hover:bg-green-600",
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      <Save className={cn("w-4 h-4", isLoading && "invisible")} />
      {showLabel && <span className={isLoading ? "invisible" : ""}>Save</span>}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </Button>
  )
}