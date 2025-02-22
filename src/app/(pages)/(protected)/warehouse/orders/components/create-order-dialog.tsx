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
      <DialogContent className="max-w-4xl  max-h-[90vh] p-0 gap-0">
      {/* <DialogContent className="max-w-4xl max-h-[90%] p-0 overflow-scroll"> */}
          <DialogHeader className="px-6 pt-4 bg-slate-100 border-b">
            <DialogTitle className="text-xl">Create New Order</DialogTitle>
          </DialogHeader>
            <OrderForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}