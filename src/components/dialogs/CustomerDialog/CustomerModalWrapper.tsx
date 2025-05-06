
"use client"

import { useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CustomerForm from "./CustomerForm"
import { useIsMobileTEST } from "@/hooks/use-media-query"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Building2, Plus, PlusIcon, RefreshCw, User2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { useCustomersStore } from "@/stores/customer-store"


export default function CustomerModalWrapper({
  children,
  isEditMode = false // Default to false
}: { children?: ReactNode, isEditMode?: boolean }) { // Add isEditMode prop

  const store = useCustomersStore()
  const [ isOpen, setIsOpen ] = useState(false)

  // Initialize state based on mode and data availability at render time
  const initialIsFormSelected = isEditMode && !!store.selectedCustomerData;
  const initialCustomerType = isEditMode ? store.selectedCustomerData?.customerType : undefined;

  const [ isFormSelected, setIsFormSelected ] = useState(initialIsFormSelected)
  const [ customerType, setCustomerType ] = useState<"INDIVIDUAL" | "BUSINESS" | undefined>(initialCustomerType)

  const isMobile = useIsMobileTEST()

  // Handles opening and closing, resetting state appropriately
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setIsFormSelected(false);
      setCustomerType(undefined);
      // Optionally clear selected customer from store on close if desired
      // store.clearSelectedCustomer();
    } else {
      // When opening, determine if we should go straight to the form
      const shouldAutoSelectForm = isEditMode && !!store.selectedCustomerData;
      setIsFormSelected(shouldAutoSelectForm);
      setCustomerType(shouldAutoSelectForm ? store.selectedCustomerData?.customerType : undefined);
    }
    setIsOpen(open); // Update the open state
  };

  const openForm = (open: boolean, type: "INDIVIDUAL" | "BUSINESS") => {
    // This is called when user clicks a type selection button (non-edit mode)
    setIsFormSelected(open)
    setCustomerType(type)
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange} modal={true} >
        <DrawerTrigger asChild>
          {children ? children
            :
            <Button className="flex items-center gap-2">
              <PlusIcon size={16} />
            </Button>
          }
        </DrawerTrigger>
        <DrawerContent className={cn(isFormSelected && "")}>
          {/* <DrawerContent className="h-[80vh]"> */}
          {/* <DrawerHeader className="mt rounded-lg border-b border-primary/20 bg-slate-300/10"> */}
          <div className="m-1 backdrop-blur-sm bg-transparent text-ellipsis">
            <DrawerTitle className="flex items-center justify-between">
              {isEditMode && store.selectedCustomerData ? (
                <span className="text-xl">Edit Customer</span> // Just show title in edit mode
              ) : (
                <> {/* Original title and switch button for new customer mode */}
                  <span className="text-xl ">New {
                    !isFormSelected ? "" : customerType === "BUSINESS" ? "BUSINESS" : "INDIVIDUAL"} Customer</span>
                  {isFormSelected && ( // Only show switch mode if form is selected (avoids confusion on selection screen)
                    <Button variant="ghost" onClick={() => setCustomerType(customerType === "INDIVIDUAL" ? "BUSINESS" : "INDIVIDUAL")}>
                      <p className="text-slate-400">Switch Mode</p>
                      <RefreshCw size={16} className=" stroke-slate-400" />
                    </Button>)}
                </>
              )}
            </DrawerTitle>
            {/* </DrawerHeader> */}
          </div>

          {!isFormSelected ?
            <div className="p-4 flex flex-col justify-center items-center gap-4 bg-red-50 h-[50vh]">
              <Button className="my-6 p-10" onClick={() => openForm(true, 'INDIVIDUAL')}>New Individual Customer</Button>
              <Button className="my-6 mb-20 p-10" onClick={() => openForm(true, 'BUSINESS')}>New Business Customer</Button>
            </div>
            :
            <div className=" overflow-scroll duration-300">
              <CustomerForm initialData={store.selectedCustomerData} type={store.selectedCustomerData?.customerType ?? customerType!} onClose={() => handleOpenChange(false)} />
            </div>
          }
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children ? children :
            <Button
              variant="default"
              size="sm"
              className="gap-2 shadow-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>{isEditMode && store.selectedCustomerData ? "Edit Customer" : "New Customer"}</span>
            </Button>
          }
        </DialogTrigger>
        <DialogContent className="max-w-[60vw] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">
              {isEditMode && store.selectedCustomerData
                ? `Edit ${store.selectedCustomerData.customerType === "BUSINESS" ? "Business" : "Individual"} Customer`
                : isFormSelected
                  ? `Create New ${customerType === "BUSINESS" ? "Business" : "Individual"} Customer`
                  : "Select Customer Type"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isEditMode && store.selectedCustomerData
                ? "Update the customer details below"
                : !isFormSelected
                  ? "Choose customer type to continue"
                  : "Fill in the details below"}
            </DialogDescription>
          </DialogHeader>

          {!isFormSelected ? (
            <div className="grid grid-cols-2 gap-5 py-4">
              <Button
                variant="outline"
                className="h-full flex-col gap-3 p-6 border-2 border-blue-100 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors"
                onClick={() => openForm(true, 'INDIVIDUAL')}
              >
                <div className="p-3 rounded-full bg-blue-100">
                  <User2 className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-base font-medium text-blue-800">Individual</span>
                <span className="text-sm text-blue-600 font-normal text-center">
                  Personal accounts
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-full flex-col gap-3 p-6 border-2 border-purple-100 hover:border-purple-300 bg-purple-50 hover:bg-purple-100 transition-colors"
                onClick={() => openForm(true, 'BUSINESS')}
              >
                <div className="p-3 rounded-full bg-purple-100">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-base font-medium text-purple-800">Business</span>
                <span className="text-sm text-purple-600 font-normal text-center">
                  Business accounts
                </span>
              </Button>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto pr-2">
              {isEditMode? 
              <CustomerForm initialData={store.selectedCustomerData} type={store.selectedCustomerData?.customerType ?? customerType!} onClose={() => handleOpenChange(false)} />
              :<CustomerForm initialData={null} type={customerType!} onClose={() => handleOpenChange(false)} />
              }
              </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
