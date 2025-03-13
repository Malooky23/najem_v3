import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TableWrapper } from './_customer-Table/customer-table-wrapper';
import CustomerModalWrapper from './CustomerModalWrapper';

export default function CustomersPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-2 mx-6">
      <div className='flex flex-row justify-between'>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

      <CustomerModalWrapper/>
      {/* </CustomerModalWrapper> */}
      </div>

      <div className="flex-1 flex flex-col min-h-0 ">
        <TableWrapper />
      </div>
    </div>
  );
};


