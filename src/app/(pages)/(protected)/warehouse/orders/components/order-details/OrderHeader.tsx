'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSignIcon,
  Edit,
  MoreVertical,
  Printer,
  X
} from "lucide-react";
import { format } from "date-fns";
import { StatusDropdown } from "./StatusDropdown";
import { CreateOrderDialog } from "../order-form/create-order-dialog";
import { useSelectedOrderData } from "@/stores/orders-store";
import { cn } from "@/lib/utils";
import { OrderExpenseDialog } from "@/components/CreateOrderExpense/OrderExpenseDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";

interface OrderHeaderProps {
  handleClose: () => void;
  isMobile: boolean;
  isLoading: boolean;
}

function OrderHeaderLeftSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-7 w-28 rounded-full" />
      <Skeleton className="h-7 w-24 rounded-md" />
    </div>
  );
}

interface OrderHeaderRightSkeletonProps {
  handleClose: () => void;
}

function OrderHeaderRightSkeleton({ handleClose }: OrderHeaderRightSkeletonProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-8 w-10 rounded-md" />
      <Skeleton className="h-8 w-10 rounded-md" />
      <Skeleton className="h-8 w-10 rounded-md" />
      <Button
        variant='outline'
        className="gap-2 bg-red-50 hover:bg-red-400 transition-colors"
        size="sm"
        onClick={handleClose}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}


export function OrderHeader({
  handleClose,
  isMobile,
  isLoading
}: OrderHeaderProps) {
  // Access order data directly from store
  const order = useSelectedOrderData();
  const isWideScreen = useMediaQuery('(min-width: 1500px)');

  if (isLoading) {
    return (
      <div className={cn(
        "flex flex-row justify-between items-start md:items-center gap-4 w-full",
        isMobile && "px-4 pb-2"
      )}>
        <OrderHeaderLeftSkeleton />
        {isWideScreen ? <OrderHeaderRightSkeleton handleClose={handleClose} /> :
          <Skeleton className="h-8 w-10 rounded-md" />
        }

      </div>
    );
  }


  // Safety check
  if (!order) {
    return null;
  }

  const { createdAt, orderNumber } = order;
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');

  const actionButtons = (
    <>
      <Button
        className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors"
        size="sm"
      >
        <Printer className="w-4 h-4" />
      </Button>
      <OrderExpenseDialog>
        <Button
          className="gap-2 bg-blue-500 hover:bg-blue-600 transition-colors"
          size="sm"
        >
          <DollarSignIcon className="w-4 h-4" />
        </Button>
      </OrderExpenseDialog>

      <CreateOrderDialog
        isEditMode={true}
        initialData={order}
      >
        <Button
          className="gap-2 bg-purple-500 hover:bg-purple-600 transition-colors"
          size="sm"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </CreateOrderDialog>
    </>
  );



  return (
    <div className={cn(
      "flex flex-row justify-between items-start md:items-center gap-4 w-full",
      isMobile && "px-4 pb-2"
    )}>
      <div className={cn("flex gap-2 ", isMobile ? 'flex-colZ' : '')}>
        <Badge
          variant="outline"
          className="h-7 px-3 text-lg font-bold border-2 border-black bg-white rounded-full"
        >
          <p className="whitespace-nowrap">{isMobile ? '#' : 'Order #'}{orderNumber}</p>
        </Badge>
        {/* <StatusDropdown /> */}
      </div>
      <div className="flex flex-wrap gap-2">
        {isWideScreen ? (
          <>
            {actionButtons}
            <Button
              variant='outline'
              className="gap-2 bg-red-50 hover:bg-red-400 transition-colors"
              size="sm"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">

                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  <p>Print</p>
                </DropdownMenuItem>

                <CreateOrderDialog
                  isEditMode={true}
                  initialData={order}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Order
                  </DropdownMenuItem>
                </CreateOrderDialog>

                <OrderExpenseDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <DollarSignIcon className="mr-2 h-4 w-4" />
                    Edit Expense
                  </DropdownMenuItem>
                </OrderExpenseDialog>

                <DropdownMenuItem
                  onClick={handleClose}
                  className="text-red-500 focus:text-red-500"
                >

                  <X className="mr-2 h-4 w-4" />
                  Close
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </Dialog>

        )}
      </div>
    </div>
  );
}