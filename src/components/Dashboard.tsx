"use client"

import { Button } from "@/components/ui/button";
import { 
  Ship, 
  UsersRound, 
  Warehouse, 
  Package, 
  BarChart4, 
  Calendar,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock Data 
const menuItems = [
  { 
    title: 'Warehouse', 
    description: "Inventory and storage management", 
    icon: Warehouse, 
    path: '/warehouse/', 
    active: true,
    badge: '143 items',
  },
  { 
    title: 'Shipments', 
    description: "Track import/export logistics", 
    icon: Ship, 
    path: '/shipments/orders', 
    active: false,
    badge: '12 pending',
  },
  { 
    title: 'Customers', 
    description: "Manage customer details", 
    icon: UsersRound, 
    path: '/customers', 
    active: true,
    badge: '36 active',
  },
  { 
    title: 'Analytics', 
    description: "Business insights and reports", 
    icon: BarChart4, 
    path: '/shipments/orders', 
    active: false,
    badge: 'Coming soon',
  },
];

const recentActivity = [
  { id: 1, action: "Shipment #2347 updated", time: "10 min ago", type: "shipment" },
  { id: 2, action: "New order from Client ABC", time: "1 hour ago", type: "order" },
  { id: 3, action: "Inventory check completed", time: "3 hours ago", type: "inventory" },
  { id: 4, action: "New customer registered", time: "5 hours ago", type: "customer" },
  { id: 5, action: "Shipment #2342 delivered", time: "Yesterday", type: "shipment" },
];

const upcomingShipments = [
  { id: 1, destination: "Dubai, UAE", date: "Tomorrow", status: "Ready" },
  { id: 2, destination: "Jeddah, KSA", date: "Oct 12", status: "Processing" },
  { id: 3, destination: "Riyadh, KSA", date: "Oct 15", status: "Scheduled" },
];

export function DashboardShell({ session }: { session: any }) {
  return (
    <div className="p-6   min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Welcome back, {session?.user?.name || "User"}</CardTitle>
                <CardDescription>Here's what's happening with your logistics today.</CardDescription>
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Shipments</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">18</div>
                <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20">
                  +12%
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">5 require attention</p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-500">Active Orders</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">27</div>
                <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20">
                  +5%
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">3 processing now</p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-500">Inventory Items</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">143</div>
                <Badge variant="secondary" className="text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20">
                  -3%
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">8 low stock alerts</p>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Action Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {menuItems.filter(item => item.active).map(item => (
                <Link 
                  href={item.path} 
                  key={item.title}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex gap-4 items-start">
                      <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-white",
                        activity.type === "shipment" ? "bg-blue-500" :
                        activity.type === "order" ? "bg-emerald-500" :
                        activity.type === "inventory" ? "bg-amber-500" : "bg-purple-500"
                      )}>
                        {activity.type === "shipment" ? <Ship className="h-4 w-4" /> :
                         activity.type === "order" ? <Package className="h-4 w-4" /> :
                         activity.type === "inventory" ? <Warehouse className="h-4 w-4" /> :
                         <UsersRound className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Shipments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Shipments</CardTitle>
              <CardDescription>Manage your scheduled deliveries</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingShipments.map(shipment => (
                <div key={shipment.id} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{shipment.destination}</p>
                    <p className="text-sm text-gray-500">{shipment.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      shipment.status === "Ready" ? "default" :
                      shipment.status === "Processing" ? "secondary" : "outline"
                    }>
                      {shipment.status}
                    </Badge>
                    <Button size="icon" variant="ghost">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full sm:hidden">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
