import { auth } from "@/lib/auth/auth";
import { UserMenu } from "./user-menu/user-menu";
import { Search, BellIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export async function Header() {
  const session = await auth();
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full flex items-center justify-end px-4 md:px-6">
          {/* Left space for mobile menu button */}
          <div className="md:hidden w-8" />
          
          {/* Search and notification area - centered */}
          <div className="flex-1 flex items-center justify-center gap-4 max-w-md mx-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className={cn(
                  "w-full bg-background pl-8 pr-3 py-2 text-sm",
                  "border rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                )}
              />
            </div>
            
            <button className="relative p-2 rounded-full hover:bg-accent">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
          
          {/* User menu */}
          <div className="flex items-center ml-auto">
            <UserMenu session={session} />
          </div>
        </div>
      </header>
      
      
    </>
  );}