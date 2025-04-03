// 'use client';

// import { memo, useCallback } from 'react';
// import { cn } from "@/lib/utils";
// import { OrderHeader } from "./OrderHeader";
// import { OrderInfoCard } from "./OrderInfoCard";
// import { OrderItemsTable } from "./OrderItemsTable";
// import { OrderNotesCard } from "./OrderNotesCard";
// import { useOrderDetails } from '@/hooks/data-fetcher';
// import { Button } from '@/components/ui/button';
// import { useOrdersStore, useSelectedOrderId, useSelectedOrderData } from '@/stores/orders-store';
// import Loading from '@/components/ui/loading';
// import { ScrollArea } from '@/components/ui/scroll-area';

// interface OrderDetailsContainerProps {
//   isMobile: boolean;
// }

// export const OrderDetailsContainer = memo(function OrderDetailsContainer({
//   isMobile
// }: OrderDetailsContainerProps) {
//   // Use simpler store selectors to prevent infinite loops
//   const orderId = useSelectedOrderId();
//   const orderData = useSelectedOrderData();
//   const selectOrder = useOrdersStore(state => state.selectOrder);
//   console.log("OrderDetailsContainer: ", orderData);

//   // Fetch order details when needed
//   const {
//     isLoading,
//     isError,
//     error
//   } = useOrderDetails(orderId);

//   const handleClose = useCallback(() => {
//     selectOrder(null);
//   }, [ selectOrder ]);

//   // Styling classes
//   // const containerClass = cn(
//   //   isMobile
//   //     ? "h-screen w-screen overflow-y-scroll overflow-x-hidden fixed inset-0 z-50 g-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
//   //     : "mb-12 p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg border border-2 border-slate-200 overflow-hidden");

//   // const cardClass = isMobile
//   //   ? "bg-white h-full"
//   //   : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl";

//   // const containerClass = cn(
//   //   isMobile
//   //     ? "h-screen w-screen overflow-y-scroll overflow-x-hidden fixed inset-0 z-50 g-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
//   //     : "mb-12 p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg border border-2 border-slate-200 overflow-y-scroll");

//   // const cardClass = isMobile
//   //   ? "bg-white h-full"
//   //   : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl";

//   const containerClass = cn(
//     isMobile
//       ? "h-screen w-screen overflow-y-scroll overflow-x-hidden fixed inset-0 z-50 g-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
//       : "mb-12 p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg border border-2 border-slate-200 overflow-hidden");

//   const cardClass = isMobile
//     ? "bg-white h-full"
//     : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all hover:shadow-2xl";



//   // Loading state
//   if (isLoading) {
//     return (
//       <div className={cn(
//         containerClass,
//         isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
//       )}>
//         <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
//           <div className={`${isMobile ? "p-4" : "p-6"} flex items-center justify-center min-h-[200px]`}>
//             <Loading />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (isError || !orderData) {
//     return (
//       <div className={cn(
//         containerClass,
//         isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
//       )}>
//         <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
//           <div className={`${isMobile ? "p-4" : "p-6"} text-center text-gray-500`}>
//             <p>Error loading order: {error instanceof Error ? error.message : 'Unknown error'}</p>
//             <Button
//               onClick={handleClose}
//               variant="outline"
//               className="mt-4"
//             >
//               Return to Orders List
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={cn(
//       containerClass,
//       !isMobile && "w-[40%] "
//     )}>
//       <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
//         <div className={isMobile ? "p-4" : "p-6"}>
//           {/* <div className="mb-3 flex items-center justify-between "> */}
//           <div className="mb-3 flex items-center justify-between sticky top-0 bg-white/75 backdrop-blur-sm z-10">

//             <OrderHeader
//               isMobile={isMobile}
//               handleClose={handleClose}
//             />
//           </div>

//             <OrderInfoCard
//               customerId={orderData.customerId}
//               customerName={orderData.customerName}
//               orderType={orderData.orderType}
//               movement={orderData.movement}
//               packingType={orderData.packingType}
//               deliveryMethod={orderData.deliveryMethod}
//               orderMark={orderData.orderMark ? orderData.orderMark : undefined}
//             />
//             <OrderInfoCard
//               customerId={orderData.customerId}
//               customerName={orderData.customerName}
//               orderType={orderData.orderType}
//               movement={orderData.movement}
//               packingType={orderData.packingType}
//               deliveryMethod={orderData.deliveryMethod}
//               orderMark={orderData.orderMark ? orderData.orderMark : undefined}
//             />
//             <OrderInfoCard
//               customerId={orderData.customerId}
//               customerName={orderData.customerName}
//               orderType={orderData.orderType}
//               movement={orderData.movement}
//               packingType={orderData.packingType}
//               deliveryMethod={orderData.deliveryMethod}
//               orderMark={orderData.orderMark ? orderData.orderMark : undefined}
//             />

//             <OrderItemsTable items={orderData.items} />

//             <OrderNotesCard
//               notes={orderData.notes || ""}
//               orderId={orderData.orderId}
//             />


//         </div>
//       </div>
//     </div>
//   );
// });



'use client';

import { memo, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { OrderHeader } from "./OrderHeader";
import { OrderInfoCard } from "./OrderInfoCard";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderNotesCard } from "./OrderNotesCard";
import { useOrderDetails } from '@/hooks/data-fetcher';
import { Button } from '@/components/ui/button';
import { useOrdersStore, useSelectedOrderId, useSelectedOrderData } from '@/stores/orders-store';
import Loading from '@/components/ui/loading';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrderDetailsContainerProps {
  isMobile: boolean;
}

export const OrderDetailsContainer = memo(function OrderDetailsContainer({
  isMobile
}: OrderDetailsContainerProps) {
  // Use simpler store selectors to prevent infinite loops
  const orderId = useSelectedOrderId();
  const orderData = useSelectedOrderData();
  const selectOrder = useOrdersStore(state => state.selectOrder);
  console.log("OrderDetailsContainer: ", orderData);

  // Fetch order details when needed
  const {
    isLoading,
    isError,
    error
  } = useOrderDetails(orderId);

  const handleClose = useCallback(() => {
    selectOrder(null);
  }, [ selectOrder ]);

  const containerClass = cn(
    isMobile
      ? "h-screen w-screen fixed inset-0 z-50 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
      : "mb-12 p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg border border-2 border-slate-200 flex flex-col");

  const cardClass = isMobile
    ? "bg-white h-full flex flex-col"
    : "bg-white/70 backdrop-blur-sm rounded-lg shadow-xl transition-all hover:shadow-2xl flex flex-col h-full";

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        containerClass,
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
      )}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} flex items-center justify-center min-h-[200px]`}>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !orderData) {
    return (
      <div className={cn(
        containerClass,
        isMobile ? "fixed inset-0 z-50 m-0" : "w-[40%]"
      )}>
        <div className={`max-w-4xl mx-auto mt-0 ${cardClass}`}>
          <div className={`${isMobile ? "p-4" : "p-6"} text-center text-gray-500`}>
            <p>Error loading order: {error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button
              onClick={handleClose}
              variant="outline"
              className="mt-4"
            >
              Return to Orders List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      containerClass,
      !isMobile && "w-[40%]"
    )}>
      <div className={`max-w-4xl mx-auto w-full h-full ${cardClass}`}>
        {/* Header - fixed at top */}
        {/* <div className={`${isMobile ? "p-4" : "p-6 pb-2 pt-4 border-b"} flex items-center justify-between bg-transparent  z-10 sticky top-0`}>
          <OrderHeader
            isMobile={isMobile}
            handleClose={handleClose}
          />
        </div> */}

        {/* Scrollable content */}
        <div className={`${isMobile ? "px-0 pb-4" : "px-6  pb-6"} overflow-y-auto flex-1`}>
          <div className={`${isMobile ? "pt-2 px-0" : "p-6 pb-2 pt-2 mt-2 border-b"} flex items-center justify-between bg-transparent backdrop-blur-md rounded-lg  z-10 sticky top-0`}>
            <OrderHeader
              isMobile={isMobile}
              handleClose={handleClose}
            />
          </div>
          <div className={`${isMobile && "px-4"}`}>

          <OrderInfoCard
            customerId={orderData.customerId}
            customerName={orderData.customerName}
            orderType={orderData.orderType}
            movement={orderData.movement}
            packingType={orderData.packingType}
            deliveryMethod={orderData.deliveryMethod}
            orderMark={orderData.orderMark ? orderData.orderMark : undefined}
          />
          

          <OrderItemsTable items={orderData.items} />

          <OrderNotesCard
            notes={orderData.notes || ""}
            orderId={orderData.orderId}
          />
        </div>
        </div>
      </div>
    </div>
  );
});