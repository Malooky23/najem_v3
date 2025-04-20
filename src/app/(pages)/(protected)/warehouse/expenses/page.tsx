import { Suspense } from "react";
import SearchPanel from "./components/SearchPanel";
import { QuickAccess } from "@/components/quick-access";
import CreateExpenseButton from "./components/CreateExpenseButton";
import { ExpensesTable } from "./components/table/ExpensesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseHeader from "./components/ExpenseHeader";





export default function ExpensesPage() {
    return (

        <div className="px-4 h-[100vh] flex flex-col overflow-clip ">

            <ExpenseHeader/>

            <ExpensesTable />

        </div>

    )
}

