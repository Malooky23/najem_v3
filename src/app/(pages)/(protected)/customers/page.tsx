import { Suspense } from "react";
import { CustomersSkeleton } from "./CustomersLoading";
import CustomersPageWrapper from "./CustomersPageWrapper";

export default function CustomersPage(){
  return(
    <Suspense fallback={null} >
      <CustomersPageWrapper/>
    </Suspense>
  )
}