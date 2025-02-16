import { auth } from "@/lib/auth/auth";
import { LoginForm } from "./login-form";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm text-gray-600 mt-4">
         Don't have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
        </div>
      </div>
    </main>
  );
}
