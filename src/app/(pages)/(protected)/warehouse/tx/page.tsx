import { Suspense } from 'react';
import { StockMovementPage } from './components/StockMovementPage';
import Loading from '@/components/ui/loading';

export default function StockMovementsRoute() {
  return (
      <StockMovementPage />
  );
}