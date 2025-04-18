
'use client'

import { useExpenseItems, useOrderExpenses } from "@/hooks/data/useExpenses"

// import { useExpenseItems } from "@/hooks/data/useExpensesItems"
// import { db } from "@/server/db"
// import { DBfetchExpenses } from "@/server/DB-Queries/expense-queries"
// import { enrichedOrderExpenseView } from "@/server/db/schema"

export default  function UseExpenseItemsPage(){
    // const {data} = useExpenseItems()
    // const rawData = await DBfetchExpenses()
    const {data, status, error} = useExpenseItems()
    const rawData = data


    return(
        <div className="flex items-center justify-center">
            <span>Status: {status}</span>
            <span>Error: {error?.message}</span>
            <pre>{JSON.stringify(rawData,null,2)}</pre>
        </div>
    )
}