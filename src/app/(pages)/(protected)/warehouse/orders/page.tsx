import { Suspense } from 'react';
import { OrdersPage } from './components/OrdersPage';
import Loading from '@/components/ui/loading';

export default function OrdersRoute() {
  return (

      <OrdersPage />

    // <Suspense fallback={<Loading />}>
    //   <OrdersPage />
    // </Suspense>
  );
}