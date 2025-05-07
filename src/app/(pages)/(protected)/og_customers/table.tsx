// "use client";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useCustomers } from "@/hooks/data/useCustomers";
// import { format } from "date-fns";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useState } from "react";

// function getCustomerDisplayName(customer: any): string {
//   if (customer.customerType === 'BUSINESS') {
//     return customer.business?.businessName || 'N/A';
//   }
//   const { firstName, middleName, lastName } = customer.individual || {};
//   return [firstName, middleName, lastName].filter(Boolean).join(' ') || 'N/A';
// }

// function LoadingState() {
//   return (
//     <div className="space-y-3">
//       <Skeleton className="h-4 w-[250px]" />
//       <div className="rounded-md border">
//         <div className="p-4 space-y-4">
//           {Array.from({ length: 50 }).map((_, i) => (
//             <Skeleton key={i} className="h-4 w-full" />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function CustomersTable() {

//   const { data: customers, isLoading, error } = useCustomers();

//   if (isLoading) {
//     return <LoadingState />;
//   }

//   if (error) {
//     return (
//       <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
//         Error loading customers: {error instanceof Error ? error.message : 'Unknown error'}
//       </div>
//     );
//   }

//   if (!customers || customers.length === 0) {
//     return (
//       <div className="rounded-md border p-4 text-center text-gray-500">
//         No customers found
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">


//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[100px]" scope="col">Customer #</TableHead>
//               <TableHead scope="col">Name</TableHead>
//               <TableHead scope="col">Type</TableHead>
//               <TableHead scope="col">Country</TableHead>
//               {/* <TableHead className="w-[150px]" scope="col">Created</TableHead> */}
//               {/* <TableHead scope="col">ID/Tax Number</TableHead> */}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {customers.map((customer) => (
//               <TableRow key={customer.customerId}>
//                 <TableCell className="font-medium">
//                   {customer.customerNumber}
//                 </TableCell>
//                 <TableCell>{getCustomerDisplayName(customer)}</TableCell>
//                 <TableCell>
//                   <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
//                     customer.customerType === 'BUSINESS' 
//                       ? 'bg-blue-50 text-blue-700' 
//                       : 'bg-green-50 text-green-700'
//                   }`}>
//                     {customer.customerType}
//                   </span>
//                 </TableCell>
//                 <TableCell>{customer.country || 'N/A'}</TableCell>
//                 {/* <TableCell> */}
//                   {/* {format(customer.createdAt, 'PP')} */}
//                 {/* </TableCell> */}
//                 {/* <TableCell> */}
//                   {/* {customer.customerType === 'BUSINESS'  */}
//                     {/* ? (customer.business?.taxNumber || 'No Tax Number') */}
//                     {/* : (customer.individual?.personalID || 'No ID')} */}
//                 {/* </TableCell> */}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }