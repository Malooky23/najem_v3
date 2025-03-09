import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRef } from "react";

interface DropDownMenuButtonProps {
  MENU_ITEMS: MenuItemsType;
  buttonText?: string;
  onOptionSelect?: (option: { id: string; label: string }) => void;
}

type MenuItemsType = {
  id: string;
  label: string;
} []

export const DropDownMenuButton = ({ MENU_ITEMS, onOptionSelect }: DropDownMenuButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleItemClick = (option: { id: string; label: string }) => {
    if (onOptionSelect) {
      onOptionSelect(option);
    }
    // Blur the button to remove focus after selection
    setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.blur();
      }
    }, 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          ref={buttonRef}
          variant="outline" 
          onClick={(e) => e.preventDefault()}
          className="focus:ring-0 focus-visible:ring-0"
        >
            <Plus className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {MENU_ITEMS.map((option) => (
            <DropdownMenuItem 
              key={option.id} 
              onClick={() => handleItemClick(option)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}