import { auth } from "@/lib/auth/auth";
import { QUERIES } from "@/server/db/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Customer } from "@/types/customer";
import { format } from "date-fns";

function getCustomerDisplayName(customer: Customer): string {
  if (customer.customerType === 'BUSINESS') {
    return customer.business?.businessName || 'N/A';
  }
  const { firstName, middleName, lastName } = customer.individual || {};
  return [firstName, middleName, lastName].filter(Boolean).join(' ') || 'N/A';
}

export default async function CustomersPage() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const customers = await QUERIES.getCustomers(session);

  if (!customers || customers.length === 0) {
    return (
      <div className="p-4 h-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Customers</h1>
        <div className="rounded-md border p-4 text-center text-gray-500">
          No customers found
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Customers</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]" scope="col">Customer #</TableHead>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Type</TableHead>
              <TableHead scope="col">Country</TableHead>
              <TableHead className="w-[150px]" scope="col">Created</TableHead>
              <TableHead scope="col">ID/Tax Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customerId}>
                <TableCell className="font-medium">
                  {customer.customerNumber}
                </TableCell>
                <TableCell>{getCustomerDisplayName(customer)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    customer.customerType === 'BUSINESS' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {customer.customerType}
                  </span>
                </TableCell>
                <TableCell>{customer.country || 'N/A'}</TableCell>
                <TableCell>
                  {customer.createdAt 
                    ? format(new Date(customer.createdAt), 'PP')
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {customer.customerType === 'BUSINESS' 
                    ? (customer.business?.taxNumber || 'No Tax Number')
                    : (customer.individual?.personalID || 'No ID')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}