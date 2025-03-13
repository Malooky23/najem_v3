"use client"

import { useState } from "react"
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
import { Card, CardContent } from "@/components/ui/card"
import { PlusIcon, User, Building2 } from "lucide-react"
import CustomerForm from "./CustomerForm"

export default function CustomerTypeSelector() {
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [customerType, setCustomerType] = useState<"individual" | "business" | null>(null)

  const handleTypeSelect = (type: "individual" | "business") => {
    setCustomerType(type)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setCustomerType(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusIcon size={16} /> New Customer
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] md:max-w-[800px] lg:max-w-[900px]">
        {!showForm ? (
          <>
            <DialogHeader>
              <DialogTitle>Create a new customer</DialogTitle>
              <DialogDescription>
                Select the type of customer you want to create
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <Card 
                className="cursor-pointer border-2 hover:border-primary hover:shadow-md transition-all"
                onClick={() => handleTypeSelect("individual")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <User className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-xl font-medium mb-2">Individual</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a personal customer account for individuals
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer border-2 hover:border-primary hover:shadow-md transition-all"
                onClick={() => handleTypeSelect("business")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Building2 className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-xl font-medium mb-2">Business</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a commercial customer account for companies
                  </p>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                Create {customerType === "individual" ? "Individual" : "Business"} Customer
              </DialogTitle>
            </DialogHeader>
            <CustomerForm type={customerType!} onClose={handleClose} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
