// import { NextResponse } from 'next/server';
// import { auth } from '@/lib/auth/auth';
// import { db } from '@/server/db';
// import { orders, customers, users,stockMovementsView } from '@/server/db/schema';
// import { eq } from 'drizzle-orm';

// const tx = db.select().from(stockMovementsView).prepare('test')

// export async function GET() {
//   try {
//     const session = await auth();
//     if (!session) {
//       return new NextResponse('Unauthorized', { status: 401 });
//     }

//     // const allOrders = await db.query.orders.findMany({
//     //   orderBy: (orders, { desc }) => [desc(orders.createdAt)]
//     // });
//     // const view = await db.select().from(stockMovementsView).orderBy(stockMovementsView.createdAt)
//     // const view1 = await tx.execute()


//     const tr = await db.transaction(async (tx) => {
//       const view = tx.select().from(stockMovementsView).orderBy(stockMovementsView.createdAt);
//       const view1 = tx.select().from(stockMovementsView);

//       return {
//         view: await view.execute(),
//         view1: await view1.execute()
//       };
//     });

//     const combinedView = {
//       view: tr.view,
//       view1: tr.view1
//     };
    
//     return NextResponse.json(combinedView);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }