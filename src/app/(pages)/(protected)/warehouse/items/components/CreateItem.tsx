"use client"
import { Spinner } from "@heroui/spinner";
import { useState, useEffect, useRef, use } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Package,
  Tag,
  Briefcase,
  Barcode,
  Globe,
  Weight,
  Box,
  Building,
  StickyNote,
  Layers,
} from "lucide-react"

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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useIsMobileTEST } from "@/hooks/use-media-query"
import CustomerDropdown from "@/components/ui/customer-dropdown"
import { createItemsSchema, ITEM_TYPES, itemTypes } from "@/types/items"


import { useSession } from "next-auth/react"
import { ComboboxForm } from "@/components/ui/combobox"
import { useCreateItem } from "@/hooks/useItems"

export default function CreateItemForm() {
  const [open, setOpen] = useState(false)
  const [useMeters, setUseMeters] = useState(false)
  const [useKilograms, setUseKilograms] = useState(false)
  const isMobile = useIsMobileTEST()
  const { data: session } = useSession()
  if (!session) return null

  // Get the createItem mutation
  const createItemMutation = useCreateItem()

  const form = useForm<z.infer<typeof createItemsSchema>>({
    resolver: zodResolver(createItemsSchema),
    defaultValues: {
      itemName: "",
      itemBrand: "",
      itemModel: "",
      itemBarcode: "",
      itemCountryOfOrigin: "UAE",
      weightGrams: null,
      dimensions: {
        width: undefined,
        height: undefined,
        length: undefined,
      },
      notes: "",
      createdBy: session.user.id,
    },
  })


  // Add these variables to track touch events
  const formRef = useRef<HTMLFormElement>(null)
  const isTouchScrolling = useRef<boolean>(false)

  // Touch event handlers


  const handleInputTouchStart = (e: React.TouchEvent) => {
    if (isTouchScrolling.current) {
      console.log("Blurring input on touch start");
      (e.target as HTMLElement).blur();
    }
  }

  // Handle unit conversion for dimensions
  const handleDimensionChange = (field: any, value: string, dimension: "width" | "height" | "length") => {
    const numValue = value === "" ? undefined : Number.parseFloat(value)

    if (numValue !== undefined) {
      // If using meters, convert to cm for storage
      const convertedValue = useMeters ? Math.round(numValue * 100) : Math.round(numValue)
      field.onChange(convertedValue)
    } else {
      field.onChange(undefined)
    }
  }

  // Handle unit conversion for weight
  const handleWeightChange = (field: any, value: string) => {
    const numValue = value === "" ? null : (Number.parseFloat(value))

    if (numValue !== null) {
      // If using kg, convert to grams for storage
      const convertedValue = useKilograms ? Math.round(numValue * 1000) : numValue
      field.onChange(convertedValue)
    } else {
      field.onChange(null)
    }
  }

  // Format dimension value for display
  const formatDimensionValue = (value: number | undefined) => {
    if (value === undefined) return ""
    return useMeters ? (value / 100).toString() : value.toString()
  }

  // Format weight value for display
  const formatWeightValue = (value: number | null) => {
    if (value === null) return ""
    return useKilograms ? (value / 1000).toString() : value.toString()
  }

  // const formWatch = form.watch()
  // useEffect(() => {
  //   // console.log("Form watch:", formWatch)
  //   console.log("Form state:", form.formState.errors)
  // }, [formWatch, form])

  async function onSubmit(values: z.infer<typeof createItemsSchema>) {
    try {
      await createItemMutation.mutateAsync(values);
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error handling is done in the mutation's onError
      console.error("Error in form submission:", error);
    }
  }

  const FormContent = (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", createItemMutation.isPending && 'opacity-20 bg-blend-overlay cursor-progress  pointer-events-none animate-pulse')}>
        {/* Row 1 */}
        {createItemMutation.isPending && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <Spinner size="lg" color="primary" className="h-10 w-10" />
            <p className="text-primary font-medium mt-4">Creating item...</p>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Item Type */}
          <FormField
            control={form.control}
            name="itemType"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Item Type *
                </FormLabel>
                <ComboboxForm
                  name="itemType"
                  options={ITEM_TYPES.map((type) => ({ label: type, value: type }))}
                  value={field.value}
                  placeholder="Select item type"
                  enableFormMessage={false}
                  isModal={true}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Customer *
                </FormLabel>
                <CustomerDropdown {...field} isModal={true} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Item Name */}
          <FormField
            control={form.control}
            name="itemName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Item Name *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter item name"
                    {...field}
                    className="border-primary/20 focus-visible:ring-primary"
                    onTouchStart={handleInputTouchStart}
                  />
                </FormControl>
                <FormDescription>Minimum 3 characters required.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Item Barcode */}
          <FormField
            control={form.control}
            name="itemBarcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-primary" />
                  Barcode
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter barcode"
                    {...field}
                    value={field.value || ""}
                    className="border-primary/20 focus-visible:ring-primary"
                    onTouchStart={handleInputTouchStart}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Item Brand */}
          <FormField
            control={form.control}
            name="itemBrand"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Brand
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter brand name"
                    {...field}
                    value={field.value || ""}
                    className="border-primary/20 focus-visible:ring-primary"
                    onTouchStart={handleInputTouchStart}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country of Origin */}
          <FormField
            control={form.control}
            name="itemCountryOfOrigin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Country of Origin
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter country"
                    {...field}
                    value={field.value || ""}
                    className="border-primary/20 focus-visible:ring-primary"
                    onTouchStart={handleInputTouchStart}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Item Model */}
          <FormField
            control={form.control}
            name="itemModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Model
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter model number"
                    {...field}
                    value={field.value || ""}
                    className="border-primary/20 focus-visible:ring-primary"
                    onTouchStart={handleInputTouchStart}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Weight */}
          <FormField
            control={form.control}
            name="weightGrams"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between">
                  <FormLabel className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-primary" />
                    Weight {useKilograms ? "(kg)" : "(g)"}
                  </FormLabel>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="weight-unit" className="text-xs">
                      g
                    </Label>
                    <Switch id="weight-unit" checked={useKilograms} onCheckedChange={setUseKilograms} />
                    <Label htmlFor="weight-unit" className="text-xs">
                      kg
                    </Label>
                  </div>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    step={useKilograms ? "0.001" : "1"}
                    placeholder={`Enter weight in ${useKilograms ? "kilograms" : "grams"}`}
                    value={formatWeightValue(field.value ?? null)}
                    onChange={(e) => handleWeightChange(field, e.target.value)}
                    className="border-primary/20 focus-visible:ring-primary"
                    onTouchStart={handleInputTouchStart}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 5 - Dimensions */}
        <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-medium">
              <Box className="h-4 w-4 text-primary" />
              <span>Dimensions {useMeters ? "(m)" : "(cm)"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="dimension-unit" className="text-xs">
                cm
              </Label>
              <Switch id="dimension-unit" checked={useMeters} onCheckedChange={setUseMeters} />
              <Label htmlFor="dimension-unit" className="text-xs">
                m
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="dimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={useMeters ? "0.01" : "1"}
                      placeholder="Width"
                      value={formatDimensionValue(field.value)}
                      onChange={(e) => handleDimensionChange(field, e.target.value, "width")}
                      className="border-primary/20 focus-visible:ring-primary"
                      onTouchStart={handleInputTouchStart}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dimensions.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={useMeters ? "0.01" : "1"}
                      placeholder="Height"
                      value={formatDimensionValue(field.value)}
                      onChange={(e) => handleDimensionChange(field, e.target.value, "height")}
                      className="border-primary/20 focus-visible:ring-primary"
                      onTouchStart={handleInputTouchStart}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={useMeters ? "0.01" : "1"}
                      placeholder="Length"
                      value={formatDimensionValue(field.value)}
                      onChange={(e) => handleDimensionChange(field, e.target.value, "length")}
                      className="border-primary/20 focus-visible:ring-primary"
                      onTouchStart={handleInputTouchStart}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Notes - Full Width */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-primary" />
                Notes
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes here"
                  className="resize-none min-h-[100px] border-primary/20 focus-visible:ring-primary"
                  {...field}
                  value={field.value || ""}
                  onTouchStart={handleInputTouchStart}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )

  if (isMobile) {
    return (
      <Drawer disablePreventScroll={false} modal={true} open={open} onOpenChange={setOpen} >
        <DrawerTrigger asChild>
          <Button variant="default" className="bg-primary hover:bg-primary/90">
            <Package className="mr-2 h-4 w-4" />
            Create New Item
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[90vh]">
          <DrawerHeader className="mt-1 rounded-lg border-b border-primary/20 bg-primary/5">
            <DrawerTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Create New Item
            </DrawerTitle>
            <DrawerDescription>Fill in the details to create a new inventory item.</DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden form-scroll-container" id="form-container">
            <div
              className="h-full overflow-y-auto p-4 pb-0 mobile-form-container"
            >
              {FormContent}
            </div>
          </div>
          <style jsx global>{`
    /* Remove the pointer-events: none rule that's blocking input interactions */
    .form-scroll-container {
      -webkit-overflow-scrolling: touch;
      outline: none;
    }
    .mobile-form-container {
      touch-action: pan-y;
      -webkit-overflow-scrolling: touch;
    }
    /* Improve touch responsiveness */
    .mobile-form-container input,
    .mobile-form-container textarea,
    .mobile-form-container select,
    .mobile-form-container button {
      touch-action: manipulation;
    }
  `}</style>
          <DrawerFooter className="flex flex-row justify-between border-t border-primary/20 pt-2 bg-primary/5">
            <Button onClick={form.handleSubmit(onSubmit)} className="bg-primary hover:bg-primary/90">
              {createItemMutation.isPending ? 'Creating...' : 'Create Item'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }
  // ...existing code...

  // Desktop view - Dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-primary hover:bg-primary/90">
          <Package className="mr-2 h-4 w-4" />
          Create New Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">

        <DialogHeader className="border-b border-primary/20 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Create New Item
          </DialogTitle>
          <DialogDescription>Fill in the details to create a new inventory item.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] overflow-auto pr-4">
          <div className="py-4">{FormContent}</div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between sm:justify-end gap-2 border-t border-primary/20 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-primary/20 hover:bg-primary/10"
            disabled={createItemMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            className="bg-primary hover:bg-primary/90"
            disabled={createItemMutation.isPending}
          >
            {createItemMutation.isPending ? (
              <>
                
                <p className="">Creating...</p>
              </>
            ) : (
              <>Create Item</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
