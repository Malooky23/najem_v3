// import { auth } from "@/lib/auth/auth";
// import { LoginForm } from "./login-form";
// import { redirect } from "next/navigation";
// import { Card } from "@/components/ui/card";

// export default async function LoginPage() {
//   const session = await auth();

//   if (session?.user) {
//     redirect("/dashboard");
//   }



//   return (
//     <div className="flex min-h-svh flex-col items-center justify-center gap-6  p-6 md:p-10">
//       <div className="w-full max-w-sm">
//         <div className="text-center p-4">
//           <h1 className="text-2xl font-bold">Welcome back</h1>
//           <p className="text-gray-600 mt-2">Sign in to your account</p>
//         </div>
//         <LoginForm />
//         <div className="text-center text-sm text-gray-600 mt-4">
//           Don't have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
//         </div>
//       </div>
//     </div>
//   )
// }

// src/app/(pages)/(auth)/login/page.tsx
export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth/auth";
import { LoginForm } from "./login-form";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card"; // Keep Card if used, otherwise remove

// Add searchParams prop type
interface LoginPageProps {
  searchParams?: {
    callbackUrl?: string;
    error?: string; // Keep if you use error searchParam for other things
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  // Middleware should handle redirecting logged-in users,
  // but this check is a fallback/defense-in-depth.
  if (session?.user) {
    redirect("/dashboard");
  }

  // Extract callbackUrl from searchParams
  const callbackUrl = searchParams?.callbackUrl;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6  p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        {/* Pass callbackUrl to the LoginForm */}
        <LoginForm callbackUrl={callbackUrl} />
        <div className="text-center text-sm text-gray-600 mt-4">
          Don't have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  )
}
