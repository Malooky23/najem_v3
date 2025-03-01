import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { redirect } from "next/navigation";
import { Ship, UsersRound, Warehouse } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { MagicCard } from "@/components/magicui/magic-card";

// import { copyUsers } from "@/scripts/copyUsers";
// import CopyUsers from "./copyUsersButton";

const menuItems = [
  { title: 'Warehouse', message: "Manage Items, Orders and more!", icon: Warehouse, path: '/warehouse/', active: true },
  { title: 'Shipments', message: "Manage Import/Export Shipments", icon: Ship, path: '/shipments', active: false },
  { title: 'Customers', message: "Manage Customers", icon: UsersRound, path: '/customers', active: true },
] as const;

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    return redirect("/login");
  }

  return (
    <div className="p-4  flex flex-col ">
      {/* <CopyUsers/> */}
      <div className="bg-amber-300 mt-1 mb-3 rounded-lg  p-4 flex items-center justify-between">
        <h1 className="text-2xl pl-6 font-bold text-gray-900">Dashboard</h1>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold">
          CLICK ME
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col flex-shrink w-fit m-auto ">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Welcome back, {session.user.name || session.user.email}
        </h2>

        {/* User details card */}
        <pre className="text-sm text-gray-600 h-full overflow-auto ">
          Cookie Session
          {JSON.stringify(session!, null, 2)}
        </pre>
      </div>

      <div className="p-6 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {menuItems.map(({ title, icon: Icon, path, active, message }) => (
            <TooltipProvider key={title} delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={path}>
                      <Card className={cn(
                        "p-6 text-center transition-all duration-200",
                        "hover:translate-y-[-4px] hover:shadow-lg",
                        "flex flex-col items-center justify-center h-[200px]",
                        !active && "cursor-not-allowed"
                      )}>
                        <div className="text-primary mb-4">
                          <Icon size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-semibold">
                          {title}
                        </h2>
                        <CardContent >
                        <div className="flex items-center justify-center text-center h-full">
                          {message}
                        </div>
                      </CardContent>
                      </Card>
                    </Link>
                </TooltipTrigger>
                <TooltipContent >
                  <p>{active ? 'Click to manage items' : 'Coming Soon'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
}
