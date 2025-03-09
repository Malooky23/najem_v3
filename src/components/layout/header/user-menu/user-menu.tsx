import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Session } from "next-auth";
import { customAvatar } from "./avatarGenerator";
import styles from "./animation.module.css";

interface UserMenuProps {
  session: Session | null;
}

export function UserMenu({ session }: UserMenuProps) {
  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
      >
        Sign in
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 hover:bg-accent px-3 py-2 rounded-full transition-colors outline-none">
          <div className="hidden sm:block text-sm text-right">
            <div className="font-medium">{session.user.name}</div>
            {session.user.userType && (
              <div className="text-xs text-muted-foreground">
                {session.user.userType.charAt(0).toUpperCase()}
                {session.user.userType.slice(1).toLowerCase()}
              </div>
            )}
          </div>
          
          <Avatar className={`${styles.floating} h-8 w-8 rounded-full border`}>
            <AvatarFallback className="bg-primary/10 flex items-center justify-center">
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{
                  __html: customAvatar(session.user?.id || "")(),
                }}
              />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-md bg-background shadow-lg border"
      >
        <div className="flex flex-col p-2">
          <div className="px-2 py-1.5 mb-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-md"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-md"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <form action="/api/auth/signout" method="post">
            <button 
              type="submit"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded-md"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
