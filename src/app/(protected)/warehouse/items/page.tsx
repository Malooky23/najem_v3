import { Package2 } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';
import { TableWrapper } from './table/table-wrapper';

export default function ItemsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Package2 size={32} className="text-primary" />
        <h1 className="text-3xl font-bold">Items Management</h1>
      </div>

      <TableWrapper/>
      

    </div>
  );
}
