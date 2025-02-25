// "use client"

// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Badge } from "@/components/ui/badge"
// import { Trash2, Plus } from "lucide-react"
// import { cn } from "@/lib/utils"

// interface CreateOrderDialogProps {
//     open: boolean
//     onOpenChange: (open: boolean) => void
// }

// export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
//     const [movementType, setMovementType] = useState<"IN" | "OUT">("OUT")
//     const [items, setItems] = useState([{ id: 1, item: "", quantity: 1 }])

//     const addItem = () => {
//         setItems([...items, { id: items.length + 1, item: "", quantity: 1 }])
//     }

//     const removeItem = (id: number) => {
//         if (items.length > 1) {
//             setItems(items.filter((item) => item.id !== id))
//         }
//     }

//     const updateItemQuantity = (id: number, increment: boolean) => {
//         setItems(
//             items.map((item) =>
//                 item.id === id ? { ...item, quantity: increment ? item.quantity + 1 : Math.max(1, item.quantity - 1) } : item,
//             ),
//         )
//     }

//     return (
//         <div className="flex bg-slate-600 h-[90vh] overflow-scroll">

//             <Dialog open={open} onOpenChange={onOpenChange} >
//                 <DialogContent className="max-w-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//                     <DialogHeader>
//                         <DialogTitle className="text-2xl font-semibold">Create New Order</DialogTitle>
//                     </DialogHeader>

//                     <div className="grid gap-6 py-4 h-[70vh] overflow-scroll">
//                         <div className="space-y-2">
//                             <label className="text-sm font-medium">Movement Type</label>
//                             <div className="flex gap-2">
//                                 <Badge
//                                     variant="outline"
//                                     className={cn(
//                                         "px-6 py-2 cursor-pointer transition-all hover:shadow-md text-base",
//                                         movementType === "IN" ? "bg-green-500 hover:bg-green-600 text-white border-0" : "hover:bg-gray-100",
//                                     )}
//                                     onClick={() => setMovementType("IN")}
//                                 >
//                                     IN
//                                 </Badge>
//                                 <Badge
//                                     variant="outline"
//                                     className={cn(
//                                         "px-6 py-2 cursor-pointer transition-all hover:shadow-md text-base",
//                                         movementType === "OUT" ? "bg-blue-500 hover:bg-blue-600 text-white border-0" : "hover:bg-gray-100",
//                                     )}
//                                     onClick={() => setMovementType("OUT")}
//                                 >
//                                     OUT
//                                 </Badge>
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <label className="text-sm font-medium">Customer</label>
//                             <Select>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select Customer..." />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="customer1">Customer 1</SelectItem>
//                                     <SelectItem value="customer2">Customer 2</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">Packing Type</label>
//                                 <Select defaultValue="none">
//                                     <SelectTrigger>
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="none">None</SelectItem>
//                                         <SelectItem value="box">Box</SelectItem>
//                                         <SelectItem value="envelope">Envelope</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">Status</label>
//                                 <Select defaultValue="pending">
//                                     <SelectTrigger>
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="pending">PENDING</SelectItem>
//                                         <SelectItem value="processing">PROCESSING</SelectItem>
//                                         <SelectItem value="shipped">SHIPPED</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">Delivery Method</label>
//                                 <Select defaultValue="none">
//                                     <SelectTrigger>
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="none">None</SelectItem>
//                                         <SelectItem value="pickup">Pickup</SelectItem>
//                                         <SelectItem value="delivery">Delivery</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <label className="text-sm font-medium">Order Items</label>
//                             <div className="space-y-4">
//                                 {items.map((item, index) => (
//                                     <div key={item.id} className="grid grid-cols-[auto,1fr,auto] gap-4 items-start">
//                                         <div className="pt-2.5 text-sm text-gray-500 w-6">{index + 1}</div>
//                                         <div className="space-y-2">
//                                             <Select>
//                                                 <SelectTrigger>
//                                                     <SelectValue placeholder="Select an item" />
//                                                 </SelectTrigger>
//                                                 <SelectContent>
//                                                     <SelectItem value="item1">Item 1</SelectItem>
//                                                     <SelectItem value="item2">Item 2</SelectItem>
//                                                 </SelectContent>
//                                             </Select>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <div className="flex items-center">
//                                                 <Button
//                                                     type="button"
//                                                     variant="outline"
//                                                     size="icon"
//                                                     className="h-8 w-8 rounded-r-none"
//                                                     onClick={() => updateItemQuantity(item.id, false)}
//                                                 >
//                                                     -
//                                                 </Button>
//                                                 <Input
//                                                     type="number"
//                                                     value={item.quantity}
//                                                     onChange={(e) => {
//                                                         const value = Number.parseInt(e.target.value)
//                                                         if (!isNaN(value) && value > 0) {
//                                                             setItems(items.map((i) => (i.id === item.id ? { ...i, quantity: value } : i)))
//                                                         }
//                                                     }}
//                                                     className="h-8 w-14 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                                                 />
//                                                 <Button
//                                                     type="button"
//                                                     variant="outline"
//                                                     size="icon"
//                                                     className="h-8 w-8 rounded-l-none"
//                                                     onClick={() => updateItemQuantity(item.id, true)}
//                                                 >
//                                                     +
//                                                 </Button>
//                                             </div>
//                                             <Button
//                                                 type="button"
//                                                 variant="ghost"
//                                                 size="icon"
//                                                 className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
//                                                 onClick={() => removeItem(item.id)}
//                                             >
//                                                 <Trash2 className="h-4 w-4" />
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 <Button type="button" variant="outline" className="w-full border-dashed" onClick={addItem}>
//                                     <Plus className="mr-2 h-4 w-4" />
//                                     Add Item
//                                 </Button>
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <label className="text-sm font-medium">Notes</label>
//                             <Textarea placeholder="Add any additional notes here" className="min-h-[100px]" />
//                         </div>
//                     </div>

//                     <DialogFooter className="gap-2 sm:gap-0">
//                         <Button variant="outline" onClick={() => onOpenChange(false)}>
//                             Cancel
//                         </Button>
//                         <Button className="bg-green-500 hover:bg-green-600">Create Order</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </div>

//     )
// }

"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createOrderSchema, type CreateOrderInput } from "@/types/orders"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CreateOrderDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const form = useForm<CreateOrderInput>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: {
            movement: "OUT",
            packingType: "NONE",
            status: "PENDING",
            deliveryMethod: "NONE",
            items: [{ itemId: "", quantity: 1 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        name: "items",
        control: form.control,
    })

    async function onSubmit(data: CreateOrderInput) {
        console.log('123')
        setIsPending(true)

        const formData = new FormData()
        formData.append("movement", data.movement)
        formData.append("customerId", data.customerId)
        formData.append("packingType", data.packingType)
        formData.append("status", data.status)
        formData.append("deliveryMethod", data.deliveryMethod)
        formData.append("notes", data.notes || "")
        formData.append("items", JSON.stringify(data.items))
        console.log(formData)
        try {
            const result = { success: true }

            if (result.success) {
                toast.success("Order created successfully")
                router.refresh()
                onOpenChange(false)
            } else {
                toast.error(result.error || "Failed to create order")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[90vh] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">Create New Order</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={(form.handleSubmit(onSubmit))}
                        //   onSubmit={((data) => {
                        //       console.log(form.getValues())
                        //       data.preventDefault()
                        // form.handleSubmit(onSubmit())
                        //   ?})} 
                        className="space-y-6 ">
                        <FormField
                            control={form.control}
                            name="movement"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel>Movement Type</FormLabel>
                                    <div className="flex gap-2">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "px-6 py-2 cursor-pointer transition-all hover:shadow-md text-base",
                                                field.value === "IN"
                                                    ? "bg-green-500 hover:bg-green-600 text-white border-0"
                                                    : "hover:bg-gray-100",
                                            )}
                                            onClick={() => field.onChange("IN")}
                                        >
                                            IN
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "px-6 py-2 cursor-pointer transition-all hover:shadow-md text-base",
                                                field.value === "OUT"
                                                    ? "bg-blue-500 hover:bg-blue-600 text-white border-0"
                                                    : "hover:bg-gray-100",
                                            )}
                                            onClick={() => field.onChange("OUT")}
                                        >
                                            OUT
                                        </Badge>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Customer..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="fb722562-8bca-429e-a353-cc6e3c44dde9">Customer 1</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="packingType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Packing Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NONE">None</SelectItem>
                                                <SelectItem value="BOX">Box</SelectItem>
                                                <SelectItem value="ENVELOPE">Envelope</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PENDING">PENDING</SelectItem>
                                                <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                                                <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="deliveryMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Delivery Method</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NONE">None</SelectItem>
                                                <SelectItem value="PICKUP">Pickup</SelectItem>
                                                <SelectItem value="DELIVERY">Delivery</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2  max-h-[37%] overflow-auto">
                            <FormLabel>Order Items</FormLabel>
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[auto,1fr,auto] gap-4 items-start">
                                        <div className="pt-2.5 text-sm text-gray-500 w-6">{index + 1}</div>
                                        <div className="space-y-2">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.itemId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select an item" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="fb722562-8bca-429e-a353-cc6e3c44dde9">Item 1</SelectItem>
                                                                <SelectItem value="fb722562-8bca-429e-a353-cc6e3c44dde8">Item 2</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                            <div className="flex items-center gap-2 ">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <div className="flex items-center">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8 rounded-r-none"
                                                                        onClick={() => field.onChange(Math.max(1, field.value - 1))}
                                                                    >
                                                                        -
                                                                    </Button>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            const value = Number.parseInt(e.target.value)
                                                                            if (!isNaN(value) && value > 0) {
                                                                                field.onChange(value)
                                                                            }
                                                                        }}
                                                                        className="h-8 w-14 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8 rounded-l-none"
                                                                        onClick={() => field.onChange(field.value + 1)}
                                                                    >
                                                                        +
                                                                    </Button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => fields.length > 1 && remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-dashed"
                                            onClick={() => append({ itemId: "", quantity: 1 })}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Button>
                                    </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Add any additional notes here" className="min-h-[100px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Order
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

