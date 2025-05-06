import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"

export function ItemsSkeleton() {
    // Generate multiple skeleton rows
    const skeletonRows = Array.from({ length: 15 }, (_, i) => (
        <tr key={i} className="border-b border-gray-100">
            <td className="py-3 px-4">
                <Skeleton className="h-4 w-12" />
            </td>
            <td className="py-3 px-4">
                <Skeleton className="h-6 w-16 rounded-full" />
            </td>
            <td className="py-3 px-4">
                <Skeleton className="h-4 w-32" />
            </td>
            <td className="py-3 px-4">
                <Skeleton className="h-4 w-24" />
            </td>
            <td className="py-3 px-4 text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
            </td>
        </tr>
    ))

    return (
        <>
            <div className="sm:hidden flex items-center justify-center h-screen w-full bg-white">
                <LoadingSpinner />
            </div>

            {/* This div will be hidden on mobile and show from 'sm' breakpoint upwards */}
            {/* The original classes are preserved, with 'hidden' added for mobile
                and 'sm:flex' to restore its display type on small screens and up.
            */}
            <div className="hidden sm:flex px-4 pt-4 h-screen w-full overflow-hidden flex-col">

                <div className="px-4 pt-4 h-screen w-full overflow-hidden flex flex-col">
                    {/* PAGE HEADER */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 text-nowrap pr-4">
                            Items
                        </h1>
                        <Skeleton className="w-full h-8" />
                    </div>

                    <div className="overflow-hidden border h-full  border-gray-200 rounded-lg">
                        <table className="min-w-full h-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item ID
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Stock
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">{skeletonRows}</tbody>
                        </table>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-y-4 py-2 px-4 backdrop-blur-lg">
                        <Skeleton className="w-[50%] h-6" />
                    </div>
                </div>
            </div>
        </>
    )
}
