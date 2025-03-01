
import Link from "next/link";
import TestPage from "./tests";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircleIcon } from "lucide-react";



export default function Page() {

  return (
    <div className="p-4">
      <div className='flex flex-row'>
      <Link href={'/customers'} >
      <ArrowLeftCircleIcon className="mx-4"/>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Customers Test</h1>

      </div>
      <TestPage />
    </div>
  );
}