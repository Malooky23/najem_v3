"use client"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Check,
  ChevronsUpDown,
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import testAction from "./action"
import { useIsMobileTEST } from "@/hooks/use-media-query"
import CustomerDropdown from "@/components/ui/customer-dropdown"

// Mock data for item types and customers
const itemTypeOptions = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "furniture", label: "Furniture" },
  { value: "books", label: "Books" },
  { value: "toys", label: "Toys" },
]
const customerOptions = [
  { value: "cust_01234567890123456789012345678901234", label: "Acme Corporation" },
  { value: "cust_12345678901234567890123456789012345", label: "Globex Industries" },
  { value: "cust_23456789012345678901234567890123456", label: "Stark Enterprises" },
  { value: "cust_34567890123456789012345678901234567", label: "Wayne Enterprises" },]
const emptyStringToNull = z.string().transform((val) => (val === "" ? null : val)).nullable().optional()
const itemTypes = z.enum(["electronics", "clothing", "furniture", "books", "toys"])
// Create items schema
const createItemsSchema = z.object({
  itemType: itemTypes,
  itemName: z.string().min(3, { message: "Item Name too short, min 3 characters" }),
  itemBrand: emptyStringToNull,
  itemModel: emptyStringToNull,
  itemBarcode: emptyStringToNull,
  itemCountryOfOrigin: emptyStringToNull,
  weightGrams: z.number().nonnegative().optional().nullable(),
  dimensions: z
    .object({
      width: z.number().nonnegative().optional(),
      height: z.number().nonnegative().optional(),
      length: z.number().nonnegative().optional(),
    })
    .optional()
    .nullable(),
  customerId: z.string().min(35, { message: "please select a customer" }),
  notes: emptyStringToNull,
})

export default function OgFormMaybe() {
  const [open, setOpen] = useState(false)
  const [useMeters, setUseMeters] = useState(false)
  const [useKilograms, setUseKilograms] = useState(false)
  const isMobile = useIsMobileTEST()

  const form = useForm<z.infer<typeof createItemsSchema>>({
    resolver: zodResolver(createItemsSchema),
    defaultValues: {
      itemName: "",
      itemBrand: "",
      itemModel: "",
      itemBarcode: "",
      itemCountryOfOrigin: "",
      weightGrams: null,
      dimensions: {
        width: undefined,
        height: undefined,
        length: undefined,
      },
      notes: "",
    },
  })

    
    // Add these variables to track touch events
    const formRef = useRef<HTMLFormElement>(null)
    const touchStartY = useRef<number | null>(null)
    const touchStartX = useRef<number | null>(null)
    const isTouchScrolling = useRef<boolean>(false)
    const touchThreshold = 10 // pixels of movement to consider it scrolling
  
    // Touch event handlers
    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
      isTouchScrolling.current = false
    }
  
    const handleTouchMove = (e: React.TouchEvent) => {
      if (touchStartY.current === null || touchStartX.current === null) return
      
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current)
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current)
      
      // If moved beyond threshold, consider it scrolling
      if (deltaY > touchThreshold || deltaX > touchThreshold) {
        isTouchScrolling.current = true
      }
    }
  
    const handleTouchEnd = (e: React.TouchEvent) => {
      // If it was scrolling, prevent focus by stopping propagation
      if (isTouchScrolling.current) {
        e.stopPropagation()
        // Find any focused elements and blur them
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement !== document.body) {
          activeElement.blur()
        }
      }
      
      // Reset touch tracking
      touchStartY.current = null
      touchStartX.current = null
      isTouchScrolling.current = false
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

  function onSubmit(values: z.infer<typeof createItemsSchema>) {
    testAction(values)
    // setOpen(false)
    // form.reset()
  }

  const FormContent = (
    <Form {...form}>
      <form 
              ref={formRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
      onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1 */}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between border-primary/20 hover:border-primary/50",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? itemTypeOptions.find((option) => option.value === field.value)?.label
                          : "Select item type"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search item type..." />
                      <CommandList>
                        <CommandEmpty>No item type found.</CommandEmpty>
                        <CommandGroup>
                          {itemTypeOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={() => {
                                form.setValue("itemType", option.value as any)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  option.value === field.value ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Customer */}
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
                    value={formatWeightValue(field.value?? null)}
                    onChange={(e) => handleWeightChange(field, e.target.value)}
                    className="border-primary/20 focus-visible:ring-primary"
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )

  // Mobile view - Drawer
  if (isMobile) {
    return (
      <Drawer  autoFocus={false} open={open} onOpenChange={setOpen}>
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
          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-4 pb-0">{FormContent}</div>
          </ScrollArea>
          <DrawerFooter className="flex flex-row  justify-between border-t border-primary/20 pt-2 bg-primary/5">
            <Button onClick={form.handleSubmit(onSubmit)} className="bg-primary hover:bg-primary/90">
              Create Item
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

  // Desktop view - Dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-primary hover:bg-primary/90">
          <Package className="mr-2 h-4 w-4" />
           New Item
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
          <Button variant="outline" onClick={() => setOpen(false)} className="border-primary/20 hover:bg-primary/10">
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="bg-primary hover:bg-primary/90">
            Create Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

