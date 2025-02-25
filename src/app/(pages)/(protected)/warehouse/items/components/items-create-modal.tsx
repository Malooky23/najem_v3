// 'use client'

// import { Card } from "@/components/ui/card";
// import { Dialog } from "@/components/ui/dialog";
// import { EnrichedCustomer } from "@/types/customer";

// interface CreateItemModalProps{
//     isOpen:boolean;
//     customers: EnrichedCustomer[]
// }


// export const CreateItemModal: React.FC<CreateItemModalProps> = ({ isOpen, customers }) => {
//     // const {isOpen, customers } = data;


//     if(isOpen){
//         return(
//         <div>
//         <Dialog>
//             <form>
//                 <div>
//                     <label htmlFor="itemName">Item Name</label>
//                     <input type="text" id="itemName" name="itemName" required />
//                 </div>
//                 <div>
//                     <label htmlFor="itemDescription">Item Description</label>
//                     <textarea id="itemDescription" name="itemDescription" required></textarea>
//                 </div>
//                 <div>
//                     <label htmlFor="customer">Customer</label>
//                     <select id="customer" name="customer" required>
//                         {customers.map((customer) => (
//                             <option key={customer.customerId} value={customer.customerId}>
//                                 {customer.displayName}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <button type="submit">Create Item</button>
//             </form>
//         </Card>
//         </div>
//     )}


// }

'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EnrichedCustomer } from "@/types/customer";
import { useState } from "react";
import { CreateItemForm } from "./create-item-form";

interface CreateItemModalProps {
    // isOpen:boolean;
    customers: EnrichedCustomer[]
}



export function CreateItemModal({ customers }: CreateItemModalProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"> New Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80%] overflow-scroll">


                <DialogHeader>
                    <DialogTitle>Fill out the form</DialogTitle>
                    <DialogDescription>Please provide your information in the form below.</DialogDescription>
                </DialogHeader>

                {/* <CreateItemForm  customers={customers} onSubmit={()=>formAction}/> */}
                <CreateItemForm  customers={customers} isOpen={setOpen}/>

            </DialogContent>

        </Dialog>
    )


}