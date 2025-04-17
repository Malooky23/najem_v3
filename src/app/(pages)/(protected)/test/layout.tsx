import { FlaskConical, Home, MoveLeft } from "lucide-react";
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
            </div>
            <div className="w-full h-full">

            {children}
            </div>
            </div>
            )
    }