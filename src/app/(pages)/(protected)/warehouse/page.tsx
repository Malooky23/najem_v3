"use client"

import {
  Package2,
  ShoppingCart,
  ArrowLeftRight,
  Truck,
  Users,
  Forklift,
  Search,
  FilterX,
  ArrowRight,
  Box,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef } from 'react';

// Import React components for charts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';

// Navigation items
const menuItems = [
  { title: 'Items', icon: Package2, path: '/warehouse/items', active: true },
  { title: 'Orders', icon: ShoppingCart, path: '/warehouse/orders', active: true },
  { title: 'Item Transactions', icon: ArrowLeftRight, path: '/warehouse/tx', active: true },
  { title: 'Forklift', icon: Forklift, path: '/warehouse/forklift', active: false },
  { title: 'Labour', icon: Users, path: '/warehouse/labour', active: false },
  { title: 'Deliveries', icon: Truck, path: '/warehouse/', active: false },
] as const;

// Mock data for charts
const inventoryTrendData = [
  { name: 'Jan', items: 65, orders: 35 },
  { name: 'Feb', items: 78, orders: 42 },
  { name: 'Mar', items: 98, orders: 54 },
  { name: 'Apr', items: 87, orders: 48 },
  { name: 'May', items: 105, orders: 56 },
  { name: 'Jun', items: 115, orders: 59 },
  { name: 'Jul', items: 120, orders: 60 },
  { name: 'Aug', items: 143, orders: 62 },
];

const categoryData = [
  { name: 'Electronics', value: 45 },
  { name: 'Furniture', value: 28 },
  { name: 'Clothing', value: 17 },
  { name: 'Tools', value: 23 },
  { name: 'Office', value: 30 },
];

const storageUtilization = [
  { name: 'Used', value: 72, color: '#0088FE' },
  { name: 'Available', value: 28, color: '#ECEFF1' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Quick stats for the top of the page
const quickStats = [
  { label: 'Total Items', value: '143', icon: Package2, change: '+23 (19%)', positive: true },
  { label: 'Active Orders', value: '27', icon: ShoppingCart, change: '+3 (12%)', positive: true },
  { label: 'Storage Used', value: '72%', icon: Box, change: '-5%', positive: true },
];

// Low stock items
const lowStockItems = [
  { id: 'C-TAPE-50', name: 'Clear Tape', stock: 5, threshold: 10 },
  { id: 'B-STRETCH-1KG', name: 'Black Stretch Film 1kg', stock: 3, threshold: 15 },
  { id: 'C-STRETCH-1KG', name: 'Clear Stretch Film 1kg', stock: 20, threshold: 15 },
  { id: 'S-SACK', name: 'Small Sack', stock: 40, threshold: 50 },
];

// Custom active shape for the pie chart to make it more informative
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill={fill} fontSize={24} fontWeight="bold">
        {`${value}%`}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#888" fontSize={14}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeStorageIndex, setActiveStorageIndex] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle scroll events to determine when to show the header backdrop
  // useEffect(() => {
  //   const handleScroll = () => {
  //     const scrollPosition = window.scrollY;
  //     setIsScrolled(scrollPosition > 10);
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  return (
    <div className="min-h-screen  p-6">
      {/* Fixed Header with Blur Effect */}
      <div
        ref={headerRef}
        className={cn(
          "sticky top-0 z-10 py-6 px-6 transition-all duration-200",
          isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center sticky top-0 ">
          <div>
            <h1 className="text-3xl font-bold">Warehouse Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage your inventory and warehouse operations</p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-9 w-[150px] sm:w-[250px]"
              />
            </div>
            <Button variant="outline" size="icon">
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {menuItems.map(({ title, icon: Icon, path, active }) => (
            <TooltipProvider key={title} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {active ? (
                    <Link
                      href={path}
                      className={cn(
                        "flex flex-col items-center justify-center h-28 p-4",
                        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
                        "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                        "shadow-sm hover:shadow"
                      )}
                    >
                      <div className="text-primary mb-2">
                        <Icon size={32} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-medium text-center">{title}</h3>
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center h-28 p-4",
                        "bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700",
                        "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="text-gray-400 dark:text-gray-500 mb-2">
                        <Icon size={32} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-medium text-center text-gray-500 dark:text-gray-400">{title}</h3>
                    </div>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{active ? 'Click to manage' : 'Coming Soon'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      <div ref={contentRef} className="px-6 pb-6 space-y-6">
        {/* Quick Stats Row */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <div className="text-3xl font-bold mt-1">{stat.value}</div>
                  <p className={cn(
                    "text-sm mt-1",
                    stat.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {stat.change}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-4 backdrop-blur-sm">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 blur-sm ">
            {/* Charts Section */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Inventory Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Trend</CardTitle>
                  <CardDescription>Items and orders over the past 8 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] ">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={inventoryTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="items" stroke="#0088FE" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Improved Storage Utilization Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Storage Utilization</span>
                    <Badge variant={storageUtilization[0].value > 90 ? "destructive" :
                      storageUtilization[0].value > 75 ? "warning" : "outline"}>
                      {storageUtilization[0].value > 90 ? "Critical" :
                        storageUtilization[0].value > 75 ? "High" : "Normal"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Current warehouse space usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    {/* Progress indicator for storage usage */}
                    <div className="w-full max-w-xs flex flex-col items-center mb-4">
                      <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "absolute top-0 left-0 h-full rounded-full",
                            storageUtilization[0].value > 90 ? "bg-red-500" :
                              storageUtilization[0].value > 75 ? "bg-amber-500" : "bg-blue-500"
                          )}
                          style={{ width: `${storageUtilization[0].value}%` }}
                        />
                      </div>
                      <div className="text-center mt-2 font-medium text-3xl">
                        {storageUtilization[0].value}%
                        <span className="text-base text-gray-500 ml-1">Used</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={activeStorageIndex}
                          activeShape={renderActiveShape}
                          data={storageUtilization}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={0}
                          dataKey="value"
                          onMouseEnter={(_, index) => setActiveStorageIndex(index)}
                          onClick={(_, index) => setActiveStorageIndex(index)}
                        >
                          {storageUtilization.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 flex justify-around text-center">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Used Space</div>
                      <div className="font-medium">{storageUtilization[0].value}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Available Space</div>
                      <div className="font-medium">{storageUtilization[1].value}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Total Capacity</div>
                      <div className="font-medium">1,000 m²</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  {storageUtilization[0].value > 75 && (
                    <div className="flex items-center text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Consider optimizing space soon
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="ml-auto">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Badge variant="destructive" className="mr-2">Alert</Badge> Low Stock Items
                </CardTitle>
                <CardDescription>Items that need to be replenished soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.id}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Current Stock</div>
                          <div className={cn(
                            "font-medium",
                            item.stock < item.threshold / 2 ? "text-red-600" : "text-amber-600"
                          )}>
                            {item.stock} / {item.threshold}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Order</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="ml-auto">View All Alerts</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Items by Category</CardTitle>
                <CardDescription>Distribution of items across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="value" name="Items" fill="#8884d8">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
