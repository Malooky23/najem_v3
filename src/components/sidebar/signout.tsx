'use server'

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"

export async function SignOutButton() {
    return(
    <form action="/api/auth/signout" method="post">
        <button
            type="submit"
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded-md"
        >
            <DropdownMenuItem>
                <LogOut />
                Log out
            </DropdownMenuItem>
        </button>
    </form>
    )
}