import { auth } from "@/lib/auth/auth";
import { Spinner } from "@heroui/spinner";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "./Dashboard";



export default async function Page() {
  const session = await auth()
  if (!session?.user) {
    return redirect("/"); // Redirect to root instead of /login
  }
  
  return (
    <DashboardShell session={session} />
  );
}

