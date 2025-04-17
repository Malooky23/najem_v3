import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "@/components/ui/loading";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { Providers } from "@/lib/providers";



export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"


  return (
    <div className="flex h-full w-full overflow-hidden"> {/* **CRITICAL: flex, h-full, w-full, overflow-hidden** */}
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar variant="sidebar" session={session} className="" />
        {/* **CRITICAL: flex-1, overflow-y-auto** */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-tr from-orange-100/50 to-blue-200/50">
          <SidebarTrigger className="block sm:hidden fixed" />
          <Suspense >
            {children}
          </Suspense>
        </main>
      </SidebarProvider>
    </div>
  );
}

