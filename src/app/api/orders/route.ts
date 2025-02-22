// import { NextResponse } from 'next/server';
// import { auth } from '@/lib/auth/auth';
// import { db } from '@/server/db';
// import { orders, customers, users } from '@/server/db/schema';
// import { eq } from 'drizzle-orm';

// export async function GET() {
//   try {
//     const session = await auth();
//     if (!session) {
//       return new NextResponse('Unauthorized', { status: 401 });
//     }

//     const allOrders = await db.query.orders.findMany({
//       with: {
//         customer: {
//           columns: {
//             customerNumber: true,
//             displayName: true
//           }
//         },
//         creator: {
//           columns: {
//             firstName: true,
//             lastName: true
//           }
//         }
//       },
//       orderBy: (orders, { desc }) => [desc(orders.createdAt)]
//     });

//     return NextResponse.json(allOrders);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }