
import {
    Skeleton
} from "@/components/ui/skeleton"





function PageHeader() {
    return (
        <div className="flex justify-between mt-2 pb-2 gap-1 max-w-full">
            <h1 className="text-2xl font-bold text-gray-900 text-nowrap pb-0 pr-2 flex items-end">
                <Skeleton className="h-6 w-24" />
            </h1>
            <div className="">
                <Skeleton className="h-9 w-48" />
            </div>

            <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
            </div>
        </div>
    );
}






export default function OrdersLoading() {
    // Media query for responsive design


    return (
        <div className="px-4 h-[100vh flex flex-col overflow-hidden ">
            <PageHeader  />

            <div className="flex gap-2 flex-1 min-h-0 overflow-hidden mt-0 ">

                <div className="p-4">
                    <div className="grid grid-cols-7 gap-4 pb-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-7 gap-4 py-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </div>



                

            </div>
        </div>
    )
}