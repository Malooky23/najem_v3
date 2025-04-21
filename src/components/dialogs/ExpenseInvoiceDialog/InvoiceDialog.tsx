'use client'

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { EnrichedOrderExpenseSchemaType } from "@/types/expense";
import { DialogTitle } from "@radix-ui/react-dialog";
import { InvoiceExensesCard } from "./InvoiceExensesCard";
import { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface OrderItemsTableProps {
    selectedOrderIds: RowSelectionState

}
export default function CreateInvoiceDialog({ selectedOrderIds }: OrderItemsTableProps) {
    if (Object.keys(selectedOrderIds).length === 0) {
        return (
            <Dialog>
                <DialogTrigger>Nothing Selected </DialogTrigger>
                <DialogHeader>
                    <DialogTitle>Nothing Selected</DialogTitle>
                </DialogHeader>

                <DialogContent>


                </DialogContent>
            </Dialog>
        )
    }
    const orderIds = Object.keys(selectedOrderIds).map(key => key)

    return (
        <Dialog>
            <DialogTrigger>
                <Button>
                    Create Invoice
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Invoice</DialogTitle>
                </DialogHeader>
                {/* <InvoiceExensesCard orderExpenses={orderExpenses!} isLoading={false} /> */}
                <h1>List of ID</h1>
                {orderIds.map((id, index) => (
                    <p key={index}>{id}</p>
                ))}

            </DialogContent>
        </Dialog>
    )

}