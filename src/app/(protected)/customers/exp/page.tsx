'use client'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCustomers } from '@/hooks/use-customers';
import { DataTable } from '../table/old-data-table';
import { columns } from '../table/columns';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CustomersPage() {
  const { data, isLoading } = useCustomers()

  if (isLoading) return (<div>Loading...</div>)
  if (!data) return (<div>No Data Found</div>)

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-2">
      <div className='flex flex-row justify-between'>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <Link href={'/customers/test'} >
          <Button>TEST</Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col min-h-0  ">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};


