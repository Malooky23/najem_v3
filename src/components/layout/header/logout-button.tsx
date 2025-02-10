"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

export function LogoutButton() {
  return (
    <DropdownMenuItem 
      onSelect={(event) => {
        event.preventDefault();
        signOut();
      }}
      className="w-full outline-none"
    >
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full cursor-pointer">
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </div>
    </DropdownMenuItem>
  );
}
