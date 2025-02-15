"use client"

import { useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CustomerForm from "./CustomerForm"

export default function CustomerModalWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const [customerType, setCustomerType] = useState<"individual" | "business">("individual")

  const openModal = (type: "individual" | "business") => {
    setCustomerType(type)
    setIsOpen(true)
  }

  return (
    <>
      <div className="flex space-x-4">
        <Button onClick={() => openModal("individual")}>New Individual</Button>
        <Button onClick={() => openModal("business")}>New Business </Button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className=" max-h-[80%] overflow-auto   flex flex-col max-w-[60vw] mx-auto ">
          <DialogHeader>
            <DialogTitle>Create New {customerType === "business" ? "Business" : "Individual"} Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm type={customerType} onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

// max-w-3xl