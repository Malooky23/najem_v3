import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
    console.log("BAHAHAHHAHAHAHAHA WE LOADING BOYS")
        return(
        <div className="flex items-center bg-green-600 justify-center h-full">
            <LoadingSpinner/>
        </div>
    )
}