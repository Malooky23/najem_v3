import { Package2 } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';

export default function ItemsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Package2 size={32} className="text-primary" />
        <h1 className="text-3xl font-bold">Items Management</h1>
      </div>
      
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Manage your warehouse inventory, add new items, update stock levels, and track item details.
        </p>
        <ComingSoon />
      </div>
    </div>
  );
}
