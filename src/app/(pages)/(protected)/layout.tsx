import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Suspense } from "react";
import Loading from "@/components/ui/loading";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-full w-full overflow-hidden"> {/* **CRITICAL: flex, h-full, w-full, overflow-hidden** */}
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-tr from-orange-100/50 to-blue-200/50"> {/* **CRITICAL: flex-1, overflow-y-auto** */}
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full">
            <Loading />
          </div>
        }>
          {children}
        </Suspense>
      </main>
    </div>
  );
}