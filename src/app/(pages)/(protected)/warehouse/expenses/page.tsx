import { Suspense } from "react";
import SearchPanel from "./components/SearchPanel";
import { QuickAccess } from "@/components/quick-access";
import CreateExpenseButton from "./components/CreateExpenseButton";
import { ExpensesTable } from "./components/table/ExpensesTable";





export default function ExpensesPage() {
    return (

        <div className="px-4 h-[100vh] flex flex-col overflow-clip ">

            <div className="flex justify-between mt-2 pb-2 gap-1 max-w-full">
                <h1 className="text-2xl font-bold text-gray-900 text-nowrap pb-0 pr-2 flex items-end">
                    Expenses
                </h1>
                    {/* <Suspense fallback={<div className="flex w-full bg-green-400"></div>}> */}
                <div className="">
                    <SearchPanel />
                </div>

                <div className="flex gap-2">
                    < CreateExpenseButton />
                    <QuickAccess />
                </div>

            </div>
            
            <ExpensesTable />

        </div>

    )
}

