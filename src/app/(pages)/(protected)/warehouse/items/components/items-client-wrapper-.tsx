"use client";

import { ItemsTable } from "./items-table";
import { itemsColumns } from "./items-columns";
import { useCustomers, useItems } from "@/hooks/data-fetcher";
import { EnrichedItemsType } from "@/types/items";
import { Button } from "@/components/ui/button";
import { use, useState } from "react";
import { CreateItemModal } from "./items-create-modal";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function ItemsClientWrapper() {
  const session = useSession();
  if (!session) {
    redirect("/login");
  }
  if(session.data?.user.userType==="CUSTOMER" && session.data.user.customerId === ""){
    console.log(session.data?.user)
    redirect('/profile/register')
  }
  // console.log(session.data?.user)

  const { data: customerList, isSuccess: isCustomersSuccess, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();
  const { data: items, isSuccess: isItemsSuccess, isLoading: isItemsLoading, isError: isItemsError,} = useItems();

  // Transform items to include customerName
  const itemsWithCustomerNames =
    isItemsSuccess && isCustomersSuccess && customerList && items
      ? items.map((item) => {
          const customer = customerList.find(
            (customer) => customer.customerId === item.customerId
          );
          return {
            ...item,
            customerDisplayName: customer
              ? customer.displayName
              : "Unknown Customer", // Handle case where customer might not be found
          } as EnrichedItemsType;
        })
      : [];

  // if (isCustomersLoading || isItemsLoading) return (<div>Loading...</div>)
  if (isItemsError) return <div>Error Loading Items</div>;
  if (isCustomersError) return <div>Error Loading Customers</div>;


  return (
    <div className="  mt-1 px-8 h-[95vh]">
      <div className="flex justify-between px-2 pt-1  ">
        <h1 className="text-2xl font-bold text-gray-900 ">Items</h1>
        <CreateItemModal customers={customerList ?? []} />
      </div>
      <ItemsTable
        data={itemsWithCustomerNames}
        columns={itemsColumns}
        isLoading={isItemsLoading}
      />
    </div>
  );
}
