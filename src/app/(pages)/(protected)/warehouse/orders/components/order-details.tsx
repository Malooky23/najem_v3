"use client"
import { cn } from '@/lib/utils'
import { EnrichedOrders } from '@/types/orders'
import { parse, format, } from 'date-fns'
import { formatInTimeZone, toDate } from "date-fns-tz";
import { date } from 'drizzle-orm/mysql-core';

interface OrderDetailsProps {
  order: EnrichedOrders | null
  isMobile?: boolean
}

export function OrderDetails({ order, isMobile = false }: OrderDetailsProps) {
  if (!order) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select an order to view details
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      "PENDING": "bg-yellow-100 text-yellow-800",
      "PROCESSING": "bg-blue-100 text-blue-800",
      "READY": "bg-green-100 text-green-800",
      "COMPLETED": "bg-purple-100 text-purple-800",
      "CANCELLED": "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }
  // const dateString = '2025-02-20 21:39:48.568325+01';

  // // 1. Parse the date string
  // const parsedDate = parse(order.createdAt!.toString(), 'yyyy-MM-dd HH:mm:ss.SSSSSSXXX', new Date());
  // const parsedDate = order.created_at
  // console.log("DATE",parsedDate)

  // // 2. Specify the timezone for conversion (e.g., Europe/Stockholm)
  // const timeZone = 'Europe/Stockholm';
  // const zonedDate = utcToZonedTime(parsedDate, timeZone);

  // // 3. Format the date for display in the specified timezone
  // const formattedDateInTimeZone = format(parsedDate, 'yyyy-MM-dd HH:mm:ss zzzz',  timeZone );

  // // 4. Format the date for display with the original offset
  // const formattedDateWithOffset = format(parsedDate, 'yyyy-MM-dd HH:mm:ss XXX');
  // const testTime = formatInTimeZone(toDate(order.createdAt!),"Asia/Dubai","EEE, dd-MM-yyyy  HH:mm a")

  return (
    <div className={cn(
      "animate-slide-in",
      isMobile ? "p-4 pt-14" : "p-6"
    )}>
      <h2 className="text-2xl font-bold mb-6">Order Details</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Order Number</h3>
            <p className="mt-1 text-lg font-medium">{order.orderNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Movement Type</h3>
            <p className="mt-1 text-lg font-medium">{order.movement || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Delivery Method</h3>
            <p className="mt-1 text-lg font-medium">{order.deliveryMethod || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Packing Type</h3>
            <p className="mt-1 text-lg font-medium">{order.packingType || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Order Type</h3>
            <p className="mt-1 text-lg font-medium">{order.orderType || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Customer</h3>
          <p className="mt-1 text-lg font-medium">{order.customerName || 'N/A'}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Date</h3>
          <p className="mt-1 text-lg font-medium">
          { formatInTimeZone(toDate(order.createdAt),"Asia/Dubai","EEE, dd-MM-yyyy  HH:mm a") }
                    </p>
        </div>

        {order.items && order.items.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.itemId} className="border rounded p-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Item</h4>
                      <p className="text-sm">{item.itemName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                      <p className="text-sm">{item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Actions</h3>
          <div className={cn(
            "space-x-4",
            isMobile && "flex flex-col space-x-0 space-y-2"
          )}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full md:w-auto">
              Update Status
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors w-full md:w-auto">
              Print Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function utcToZonedTime(parsedDate: Date, timeZone: string) {
  throw new Error('Function not implemented.');
}
