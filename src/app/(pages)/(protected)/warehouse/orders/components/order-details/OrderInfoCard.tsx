import { EnrichedOrders, OrderType, MovementType, PackingType, DeliveryMethod } from "@/types/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInTimeZone, toDate } from "date-fns-tz"
import { Calendar, User, Truck, Package, Circle } from "lucide-react"; // Import icons
import { Input } from "@/components/ui/input";
import { ReactNode, useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


interface OrderInfoCardProps {
  order: EnrichedOrders;
  isEditing: boolean;
  updateOrderInfo: (newOrderInfo: Partial<EnrichedOrders>) => void;
}

export function OrderInfoCard({ order, isEditing, updateOrderInfo }: OrderInfoCardProps) {
    // State to track edited values
    const [formState, setFormState] = useState({
        customerName: order.customerName,
        deliveryMethod: order.deliveryMethod,
        movement: order.movement,
        orderType: order.orderType,
        packingType: order.packingType
    });

    // Update form state when order changes
    useEffect(() => {
        setFormState({
            customerName: order.customerName,
            deliveryMethod: order.deliveryMethod,
            movement: order.movement,
            orderType: order.orderType,
            packingType: order.packingType
        });
    }, [order]);

    // Handle select field changes
    const handleSelectChange = (field: keyof typeof formState, value: string) => {
        // Update local form state
        setFormState(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Update parent component's order state
        updateOrderInfo({ [field]: value } as any);
    };

    // Helper function to create input/select fields
    const renderField = (label: ReactNode, field: keyof typeof formState, options?: { value: string; label: string }[]) => {
        const value = formState[field];
        
        return (
            <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    {label}
                </p>
                {isEditing && options ? (
                    <Select
                        value={value?.toString()}
                        onValueChange={(newValue) => handleSelectChange(field, newValue)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={`Select ${String(field)}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <p>{value || "N/A"}</p>
                )}
            </div>
        );
    };

    // Helper function for text fields
    const renderTextField = (label: ReactNode, field: keyof typeof formState) => {
        const value = formState[field];
        
        return (
            <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    {label}
                </p>
                {isEditing ? (
                    <Input
                        value={value || ""}
                        onChange={(e) => {
                            setFormState(prev => ({
                                ...prev,
                                [field]: e.target.value
                            }));
                            updateOrderInfo({ [field]: e.target.value } as any);
                        }}
                    />
                ) : (
                    <p>{value || "N/A"}</p>
                )}
            </div>
        );
    };

  return (
    <Card className="mt-4 bg-white/70 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Order Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {renderTextField(<> <User className="w-4 h-4 inline-block mr-1" /> Customer</>, "customerName")}
        {renderField(<> <Truck className="w-4 h-4 inline-block mr-1" /> Delivery Method</>, "deliveryMethod", [
            { value: "NONE", label: "None" },
            { value: "PICKUP", label: "Pickup" },
            { value: "DELIVERY", label: "Delivery" },
        ])}
        <div>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4 inline-block mr-1" /> Order Date
          </p>
          <p>
            {order.createdAt
              ? formatInTimeZone(
                toDate(order.createdAt),
                "Asia/Dubai",
                "EEE, dd-MM-yyyy, HH:mm"
              )
              : "N/A"}
          </p>
        </div>
        {renderField(<> <Package className="w-4 h-4 inline-block mr-1" /> Movement Type</>, "movement", [
            { value: "IN", label: "In" },
            { value: "OUT", label: "Out" },
        ])}
        {renderField(<>Order Type</>, "orderType", [
            {value: "CUSTOMER_ORDER", label: "Customer Order"},
            {value: "STOCK_ORDER", label: "Stock Order"}
        ])}
        {renderField(<>Packing Type</>, "packingType", [
            { value: "SACK", label: "Sack" },
            { value: "PALLET", label: "Pallet" },
            { value: "CARTON", label: "Carton" },
            { value: "OTHER", label: "Other" },
            { value: "NONE", label: "None" },
        ])}
      </CardContent>
    </Card>
  );
}