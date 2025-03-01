"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import OrderForm from "./OrderForm";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CreateOrderDialogProps {
  isMobile: boolean;
}

export function CreateOrderDialog({ isMobile }: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Order</Button>
      </DialogTrigger>
      <DialogContent className="w-[70%] max-w-[90%] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-4 bg-slate-100 border-b sticky top-0 z-50">
          <DialogTitle className="text-xl">Create New Order</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[calc(90vh-120px)]"> {/* Add scrollable container */}
          <OrderForm onClose={() => setOpen(false)} />
        </div>
      </DialogContent>

    </Dialog>
  );
}
// {/* <DialogContent className="max-w-[90%] max-h-[90vh]  p-0 gap-0">
//   {/* <DialogContent className="max-w-4xl max-h-[90%] p-0 overflow-scroll">//max-h-[80vh]  */}
//   {/* <DialogHeader className="px-6 pt-4 bg-slate-100 border-b"> */}
//   <DialogHeader className="px-6 pt-4 bg-slate-100 border-b sticky top-0 z-50">

//     <DialogTitle className="text-xl">Create New Order</DialogTitle>
//   </DialogHeader>



//   <OrderForm onClose={() => setOpen(false)} />

// </DialogContent> */}