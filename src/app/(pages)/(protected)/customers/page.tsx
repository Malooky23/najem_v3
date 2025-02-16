import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CreateCustomerButton } from '@/components/OLD-create-customer-modal-wrapper';
import { TableWrapper } from './_customer-Table/customer-table-wrapper';
import CustomerModalWrapper from './CustomerModalWrapper';

export default function CustomersPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-2 mx-6">
      <div className='flex flex-row justify-between'>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <Link href={'/customers/test'} >
          <Button>TEST</Button>
        </Link>
        {/* <div className="flex gap-2">
          <CreateCustomerButton type="individual" />
          <CreateCustomerButton type="business" />
        </div> */}
      <CustomerModalWrapper/>
      {/* </CustomerModalWrapper> */}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <TableWrapper />
      </div>
    </div>
  );
};


