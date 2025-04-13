import { Suspense } from "react";
import OrdersPageWrapper from "./OrderWrapper";

export default function OrdersPage(){
  return(
    <Suspense fallback={<div className="h-full w-full bg-yellow-300"/>}>
      <OrdersPageWrapper/>
    </Suspense>
  )
}