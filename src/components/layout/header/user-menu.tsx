import Link from "next/link";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import {
  NavigationMenuItem,
  NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { LogoutButton } from "./logout-button";
import { Session } from "next-auth";
import { customAvatar } from "./avatarGenerator";
import styles from "./animation.module.css";


interface UserMenuProps {
  session: Session | null;
}

// const userType = session.user.userType;
// const shouldShow = userType === 'EMPLOYEE';

// const displayUserType = shouldShow ? 'EMPLOYEE' : `${userType.charAt(0).toUpperCase()}${userType.slice(1).toLowerCase()}`;

export function UserMenu({ session }: UserMenuProps) {
  return (
    <NavigationMenuList className="flex items-center gap-4">
      {session?.user ? (
        <NavigationMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors outline-none">
                <div className="hidden sm:block text-sm text-right mr-2">
                  <div className="font-medium">{session.user.name}</div>
                  {session.user.userType === "EMPLOYEE" && (
                    <div className="text-xs text-gray-500">
                      {/* FIX THIS IN RESPONSIVE */}
                      {session.user.userType.charAt(0).toUpperCase()}
                      {session.user.userType.slice(1).toLowerCase()}
                    </div>
                  )}
                </div>
                
                <Avatar className={styles.floating}>

                  <AvatarFallback className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    {/* <User className="h-5 w-5 text-gray-600" />  */}
                    {/* THIS IS WHERE THE AVATAR WILL BE */}
                    {/* {customAvatar(session.user?.id || '')} */}
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
              className="w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div className="py-1">
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 outline-none cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <div className="h-px bg-gray-200 my-1" />
                <LogoutButton />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </NavigationMenuItem>
      ) : (
        <NavigationMenuItem>
          <Link
            href="/login"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          >
            Sign in
          </Link>
        </NavigationMenuItem>
      )}
    </NavigationMenuList>
  );
}
