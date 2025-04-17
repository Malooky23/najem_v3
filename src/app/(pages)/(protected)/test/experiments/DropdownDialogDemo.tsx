import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, // Optional: for section labels
    DropdownMenuSeparator, // Optional: for separators
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react" // Example icon for the trigger button

export function DropdownDialogDemo() {
    return (
        // The Dialog component still wraps everything because one of the dropdown
        // items needs to trigger THIS specific dialog instance.
        <Dialog>
            {/* DropdownMenu replaces ContextMenu */}
            <DropdownMenu>
                {/* DropdownMenuTrigger replaces ContextMenuTrigger */}
                {/* We'll use a Button as a common trigger element */}
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                {/* DropdownMenuContent replaces ContextMenuContent */}
                <DropdownMenuContent align="end">
                    {/* Optional Label */}
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {/* DropdownMenuItem replaces ContextMenuItem */}
                    <DropdownMenuItem onClick={() => console.log("Open clicked")}>
                        Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Download clicked")}>
                        Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator /> {/* Optional Separator */}

                    {/* IMPORTANT: DialogTrigger stays here, wrapping the specific DropdownMenuItem */}
                    {/* It needs to be INSIDE the main Dialog but OUTSIDE DropdownMenu */}
                    <DialogTrigger asChild>
                        {/* Add inset if you want alignment with icons/checkboxes, or remove */}
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* DialogContent and its children remain exactly the same */}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. Are you sure you want to permanently
                        delete this file from our servers?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {/* Add Cancel button maybe? */}
                    {/* <DialogClose asChild> // Optional: Close button
            <Button variant="outline">Cancel</Button>
          </DialogClose> */}
                    <Button type="submit" variant="destructive">Confirm Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}