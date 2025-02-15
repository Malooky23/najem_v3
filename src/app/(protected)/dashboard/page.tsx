
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";
import { QUERIES } from "@/server/db/queries";
import { Suspense } from "react";
import {LoadingSpinner} from "@/components/ui/loading-spinner";
import { redirect } from "next/navigation";
// import { copyUsers } from "@/scripts/copyUsers";
// import CopyUsers from "./copyUsersButton";


const UserDetailsCard = async () => {
    const session = await auth();
    if (!session?.user) {
        return <div>Unauthorized</div>
    }

    const userdDb = await QUERIES.getUserById(session.user.id!)

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <div className="bg-gray-50 rounded-md p-1 flex-grow">
                <pre className="text-sm text-gray-600 h-full overflow-auto">
                    {JSON.stringify(userdDb, null, 2)}
                </pre>
            </div>
        </Suspense>
    )
}

export default async function Page() {
    const session = await auth();
    if (!session?.user) {
        return redirect('/login')
    }
    
    return (
        <div className="p-1  flex flex-col">
    {/* <CopyUsers/> */}
            <div className="bg-amber-300 mt-1 mb-3 rounded-lg  p-4 flex items-center justify-between">
                <h1 className="text-2xl pl-6 font-bold text-gray-900">Dashboard</h1>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold">CLICK ME</Button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Welcome back, {session.user.name || session.user.email}
                </h2>

                {/* User details card */}
                <pre className="text-sm text-gray-600 h-full overflow-auto">

                    {JSON.stringify(session!.user, null, 2)}
                </pre>
                <Suspense fallback={<LoadingSpinner />}>
                    <UserDetailsCard />
                </Suspense>
            </div>
        </div>
    )
}
