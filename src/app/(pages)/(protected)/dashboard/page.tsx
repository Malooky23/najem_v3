import { auth } from "@/lib/auth/auth";
import { Spinner } from "@heroui/spinner";

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "./Dashboard";

export default async function Page() {
const session = await auth()
    if (!session?.user) {
      return redirect("/login");
    }
  
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner className="h-8 w-8" />
        </div>
      }>
        <DashboardShell session={session} />
      </Suspense>
    );
  }
  