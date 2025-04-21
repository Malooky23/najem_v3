import { FlaskConical, HardHat, Home, MoveLeft, Pen, PenBox, Table } from "lucide-react";
import Link from "next/link";


export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex p-4 h-full">
            <div className="flex-row h-[100%] w-fit bg-white space-y-2">
                <Link className="bg-slate-300  flex p-2 w-[200px]" href='/test/'><Home /> <FlaskConical />Test Page</Link>
                <Link className="bg-slate-300  flex p-2 w-[200px]" href='/test/experiments'><FlaskConical />Experiments Page</Link>
                <Link className="bg-slate-300  flex p-2 w-[200px]" href='/test/table-page'><Table />Test Table Page</Link>
                <Link className="bg-slate-300  flex p-2 w-[200px]" href='/test/expense-items'><HardHat />expense-items</Link>
                <Link className="bg-slate-300  flex p-2 w-[200px]" href='/test/zoho'><HardHat />zoho</Link>
                <Link className="bg-slate-300  flex p-2 w-[200px]" href='/test/debounce'><HardHat />debounce</Link>
            </div>
            <div className="w-full h-full">

            {children}
            </div>
            </div>
            )
    }