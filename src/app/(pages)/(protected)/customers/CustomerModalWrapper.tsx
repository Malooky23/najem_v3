"use client"

import { useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CustomerForm from "./CustomerForm"
import { useIsMobileTEST } from "@/hooks/use-media-query"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { PlusIcon, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"


export default function CustomerModalWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const [customerType, setCustomerType] = useState<"individual" | "business">()
  const isMobile = useIsMobileTEST()
  const openModal = (type: "individual" | "business") => {
    setCustomerType(type)
    setIsOpen(true)
  }


  const [isFormSelected, setIsFormSelected] = useState(false)

  const openForm = (open: boolean, type: "individual" | "business") => {
    setIsFormSelected(open)
    setCustomerType(type)

    setIsOpen(true)
  }

  const resetState = () => {
    setIsFormSelected(false)
    setIsOpen((isOpen) => !isOpen)
  }



  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={resetState}  modal={true} >
        <DrawerTrigger asChild>
          <Button className="flex items-center gap-2">
            <PlusIcon size={16} />
          </Button>
        </DrawerTrigger>
        <DrawerContent className={cn(isFormSelected && "")}>
        {/* <DrawerContent className="h-[80vh]"> */}
          {/* <DrawerHeader className="mt rounded-lg border-b border-primary/20 bg-slate-300/10"> */}
          <div className="m-1 backdrop-blur-sm bg-transparent text-ellipsis">
            <DrawerTitle className="flex items-center justify-between">
              <span className="text-xl ">New {
                !isFormSelected ? "" : customerType === "business" ? "Business" : "Individual"} Customer</span>
              <Button variant="ghost" onClick={() => setCustomerType(customerType === "individual" ? "business" : "individual")}>
                {/* {customerType === "individual" ? "Switch to Business" : "Switch to Individual"} */}
                <p className="text-slate-400">Switch Mode</p>
                <RefreshCw size={16} className=" stroke-slate-400" />
              </Button>
            </DrawerTitle>
            {/* </DrawerHeader> */}
          </div>

          {!isFormSelected ?
            <div className="p-4 flex flex-col justify-center items-center gap-4 bg-red-50 h-[50vh]">
              <Button className="my-6 p-10" onClick={() => openForm(true, 'individual')}>New Individual Customer</Button>
              <Button className="my-6 mb-20 p-10" onClick={() => openForm(true, 'business')}>New Business Customer</Button>
            </div>
            :
            <div className=" overflow-scroll duration-300">
              <CustomerForm type={customerType!} onClose={() => setIsOpen(false)} />
            </div>
          }
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <>
      <div className="flex space-x-4">
        <Button onClick={() => openModal("individual")}>New Individual</Button>
        <Button onClick={() => openModal("business")}>New Business </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className=" max-h-[80%] overflow-hidden   flex flex-col max-w-[60vw] mx-auto ">
          <DialogHeader>
            <DialogTitle>Create New {customerType === "business" ? "Business" : "Individual"} Customer</DialogTitle >
          </DialogHeader >
          <CustomerForm type={customerType!} onClose={() => setIsOpen(false)} />
        </DialogContent >
      </Dialog >
    </>
  )
}




// max-w-3xl