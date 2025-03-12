'use client'
import { CreateOrderDialog } from "./create";

export default function page(){

    return (
        <CreateOrderDialog 
        open={true} 
        onOpenChange={foo}
      />
    )
}

export function foo(){
    console.log("foo")
}