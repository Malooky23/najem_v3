import { Suspense } from "react";
import OrdersPageWrapper from "./OrdersPageWrapper";
import OrdersLoading from "./suspense";

export default function OrdersPage(){
  // <Suspense fallback={<div className="h-full w-full bg-yellow-300"/>}>
  return(
    <Suspense fallback={<OrdersLoading/>}>
      <OrdersPageWrapper/>
     </Suspense>
  )
}