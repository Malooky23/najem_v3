import { Suspense } from "react";
import { ItemsSkeleton } from "./ItemsLoading";
import ItemsPageWrapper from "./ItemsPageWrapper";

export default function ItemsPage(){
  return(
    <Suspense fallback={<ItemsSkeleton/>} >
      <ItemsPageWrapper/>
    </Suspense>
  )
}