"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createOrderSchema, type CreateOrderInput } from "@/types/orders";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CustomerSelector from "@/components/ui/customer-dropdown";
import { createOrder } from "@/server/actions/orders";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers, useSelectCustomerList } from "@/hooks/data-fetcher";
import { is } from "drizzle-orm";
import { Skeleton } from "@/components/ui/skeleton";
import { EnrichedCustomer } from "@/types/customer";

export default function CreateOrderPage() {

  const { data: customerList, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading, isError: isCustomersError } = useSelectCustomerList();

  const router = useRouter();
  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      orderType: "CUSTOMER_ORDER",
      packingType: "NONE",
      deliveryMethod: "NONE",
      status: "PENDING",
      items: []
    }
  });

  async function onSubmit(data: CreateOrderInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'items') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined) {
        formData.append(key, value?.toString() ?? "");
      }
    });

    const result = await createOrder(formData);

    if (result.success) {
      toast.success("Order created successfully");
      router.push("/orders");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create order");
    }
  }

  if (isCustomersError) {
    return (
      <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
        Error loading customers
      </div>
    )
  }
  
  // Add a loading state for the entire form
  // if (isCustomersLoading) {
  //   return (
  //     <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
  //       <Card className="w-full">
  //         <CardHeader>
  //           <CardTitle>Create New Order</CardTitle>
  //           <CardDescription>Loading order form...</CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <div className="space-y-6">
  //             <Skeleton className="w-full h-10" />
  //             <Skeleton className="w-full h-10" />
  //             <Skeleton className="w-full h-10" />
  //             <Skeleton className="w-full h-[120px]" />
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
          <CardDescription>Fill in the details to create a new order</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer <span className="text-red-500">*</span></label>
                    {false ? (
                    // {isCustomersLoading ? (
                      <Skeleton className="w-full h-10" />
                    ):(
                    <CustomerSelector
                      customersInput={customerList as EnrichedCustomer[]?? []}
                      value={form.watch('customerId')}
                      onChange={(value) => form.setValue('customerId', value ?? "")}
                      isRequired={true}
                      />
                  )
                }
                </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Movement Type</label>
                    <Select
                      onValueChange={(value) => form.setValue("movement", value as "IN" | "OUT")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select movement type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN">IN</SelectItem>
                        <SelectItem value="OUT">OUT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Packing Type</label>
                    <Select
                      onValueChange={(value) => form.setValue("packingType", value as any)}
                      defaultValue="NONE"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select packing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="SACK">Sack</SelectItem>
                        <SelectItem value="PALLET">Pallet</SelectItem>
                        <SelectItem value="CARTON">Carton</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Delivery Method</label>
                    <Select
                      onValueChange={(value) => form.setValue("deliveryMethod", value as any)}
                      defaultValue="NONE"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select delivery method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="PICKUP">Pickup</SelectItem>
                        <SelectItem value="DELIVERY">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      placeholder="Add any additional notes here"
                      className="min-h-[120px]"
                      {...form.register("notes")}
                    />
                  </div>
                </div>
              </div>

              {/* TODO: Add dynamic items section */}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/warehouse/orders')}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                >
                  Create Order
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}