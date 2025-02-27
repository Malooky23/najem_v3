"use client";

import { ItemsTable } from "./items-table";
import { itemsColumns } from "./items-columns";
import { useCustomers, useItems } from "@/hooks/data-fetcher";
import { EnrichedItemsType } from "@/types/items";
import { Button } from "@/components/ui/button";
import { Suspense, use, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import CreateItemModal, { CreateItemModalProps } from "./items-create-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";


// const CreateModal = dynamic<CreateItemModalProps>(
//   () => import('./items-create-modal').then(mod => mod.default),
//   {
//     loading: () => 
//       <Button variant="outline">
//         <LoadingSpinner className=""/>
//       </Button>
//     ,
//     ssr: false,
//   }
// );

export function ItemsClientWrapper() {
  const session = useSession();
  if (!session) {
    redirect("/login");
  }
  if (session.data?.user.userType === "CUSTOMER" && session.data.user.customerId === "") {
    console.log(session.data?.user)
    redirect('/profile/register')
  }
  // console.log(session.data?.user)

  const { data: customerList, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();
  const { data: items, isSuccess: isItemsSuccess, isLoading: isItemsLoading, isError: isItemsError, } = useItems();

  // Transform items to include customerName
  const itemsWithCustomerNames = useMemo(() =>
    isItemsSuccess && isCustomersSuccess && customerList && items
      ? items.map((item) => ({
        ...item,
        customerDisplayName: customerList.find(
          (customer) => customer.customerId === item.customerId
        )?.displayName ?? "Unknown Customer"
      }))
      : [],
    [items, customerList, isItemsSuccess, isCustomersSuccess]
  );


  // if (isCustomersLoading || isItemsLoading) return (<div>Loading...</div>)
  if (isItemsError) return <div>Error Loading Items</div>;
  if (isCustomersError) return <div>Error Loading Customers</div>;


  return (
    <div className="flex flex-col flex-1 px-4">
      <div className="flex justify-between m-2 ">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        {/* <CreateModal customers={customerList?? []}/> */}
        <Suspense fallback={<div> <LoadingSpinner /></div>}>
          <CreateItemModal customers={customerList ?? []} />
        </Suspense>

      </div>
      {/* <div className="flex flex-row flex-1 justify-between"> */}
        <ItemsTable
          data={itemsWithCustomerNames}
          columns={itemsColumns}
          isLoading={isItemsLoading}
        />
        {/* <div className="flex flex-col flex-1 justify-center">
          
        </div> */}
      {/* </div> */}
    </div>
  );
}