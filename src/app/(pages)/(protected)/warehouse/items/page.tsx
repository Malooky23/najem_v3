import { Package2 } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';
import { TableWrapper } from './items-table/items-table-wrapper';

export default function ItemsPage() {
  return (
    <div className="p-2 mx-6  h-[calc(100vh-4rem)] flex flex-col">

      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">Items Management</h1>
      </div>

      <div className="flex-1 flex flex-col min-h-0">

      <TableWrapper/>
      </div>

      

    </div>
  );
}

