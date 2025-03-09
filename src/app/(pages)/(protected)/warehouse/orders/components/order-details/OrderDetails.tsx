import { OrderHeader } from "./OrderHeader";
import { OrderInfoCard } from "./OrderInfoCard";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderNotesCard } from "./OrderNotesCard";
import { EnrichedOrders, OrderStatus } from "@/types/orders";
import { useOrderForm } from "../hooks/useOrderForm";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";

interface OrderDetailsProps {
  order: EnrichedOrders | null;
  isMobile?: boolean;
  isLoading?: boolean;
  isProcessing?: boolean;
  onSave?: (updatedOrder: EnrichedOrders) => void;
  handleClose: () => void;
}

// Define a type for the default form
type DefaultFormType = {
  watch: () => any;
  setValue: (name: string, value: any) => void;
  getValues: () => any;
  trigger: () => Promise<boolean>;
  formState: { errors: any };
  handleSubmit: (fn: any) => any;
  reset: () => void;
  control: any;
};

const defaultForm: DefaultFormType = {
  watch: () => ({}),
  setValue: () => { },
  getValues: () => ({}),
  trigger: async () => true,
  formState: { errors: {} },
  handleSubmit: (fn: any) => (e?: any) => { fn(); },
  reset: () => { },
  control: null,
};

export function OrderDetails({
  order,
  isMobile = false,
  isLoading = false,
  isProcessing = false,
  onSave,
  handleClose
}: OrderDetailsProps) {
  const containerClass = isMobile
    ? "p-4 h-full overflow-scroll"
    : "p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-full overflow-hidden";

  const cardClass = isMobile
    ? "bg-white"
    : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl";

  // Conditionally initialize useOrderForm
  const {
    form,
    isEditing,
    isSaving,
    handleSave,
    handleEdit,
    handleCancel
  } = order ? useOrderForm({
    order,
    onSave: async (values: EnrichedOrders) => {
      if (!onSave) {
        throw new Error('Cannot save: save callback is not provided');
      }
      await onSave(values);
    },
    isProcessing // Pass down the processing state
  }) : {
    form: defaultForm as any,
    isEditing: false,
    isSaving: false,
    handleSave: () => { },
    handleEdit: () => { },
    handleCancel: () => { }
  };

  const handleStatusChange = async (status: OrderStatus) => {
    // Don't proceed if order is null
    if (!order) return;

    // Don't proceed if status hasn't changed
    if (order.status && status === order.status) {
      toast({
        description: "Status is already " + status,
        variant: "default",
      });
      return;
    }

    try {
      if (form) {
        form.setValue("status", status);
        if (!isEditing) {
          await handleSave();
        }
      }
    } catch (error) {
      // Revert on error
      if (form) {
        form.setValue("status", order.status);
      }
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} flex items-center justify-center min-h-[200px]`}>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={containerClass}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} text-center text-gray-500`}>
            <p>Order details not found or no longer available.</p>
            <button
              onClick={handleClose}
              className="mt-4 text-blue-500 hover:text-blue-600 underline"
            >
              Return to Orders List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
        <div className={isMobile ? "p-4" : "p-6"}>
          <OrderHeader
            orderNumber={order.orderNumber.toString()}
            status={order.status}
            isEditing={isEditing}
            isMobile={isMobile}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onSave={handleSave}
            onClose={handleClose}
          />

          <OrderInfoCard
            order={order}
            form={form}
            isEditing={isEditing}
          />

          <OrderItemsTable
            order={order}
            form={form}
            isEditing={isEditing}
          />

          <OrderNotesCard
            order={order}
            form={form}
            isEditing={isEditing}
          />
        </div>
      </div>
    </div>
  );
}