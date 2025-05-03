
'use client'
import { deleteCustomer } from "@/components/dialogs/CustomerDialog/actions"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useCustomersStore } from "@/stores/customer-store"
import { useQueryClient } from "@tanstack/react-query"
import { ReactNode } from "react"

interface DeleteCustomerDialogProps {

    children?: ReactNode
}
export default function DeleteCustomerDialog({
    children,
}: DeleteCustomerDialogProps) {
    const store = useCustomersStore()
    const queryClient = useQueryClient()
    return (

        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children ? children
                    : <Button variant="outline">Show Alert Dialog</Button>}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete: {store.selectedCustomerData?.displayName}?
                        {/* <form onSubmit={()=>deleteCustomer(store.selectedCustomerId ?? '')}>

                        </form> */}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={async (e) => {
                        e.preventDefault
                        const result = await deleteCustomer(store.selectedCustomerId ?? '')
                        console.log(result)
                        queryClient.invalidateQueries({ queryKey: [ 'customers' ] })
                        store.selectCustomer(null, null)
                    }}
                        className="bg-red-400 hover:bg-red-600  transition-all hover:scale-[102%]">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    )
}
