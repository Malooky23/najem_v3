"use client"
import {cn} from '@/lib/utils'
interface Order {
  orderId: string
  orderNumber: string
  customerName: string
  status: string
  date: string
  total: number
}

interface OrderDetailsProps {
  order: Order | null
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
      "SHIPPED": "bg-green-100 text-green-800",
      "DELIVERED": "bg-purple-100 text-purple-800",
      "CANCELLED": "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

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
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Customer</h3>
          <p className="mt-1 text-lg font-medium">{order.customerName}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Date</h3>
          <p className="mt-1 text-lg font-medium">
            {new Date(order.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Total</h3>
          <p className="mt-1 text-lg font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(order.total)}
          </p>
        </div>

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