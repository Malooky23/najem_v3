import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";

export default async function RootPage() {
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }
  
  // Show landing page for non-authenticated users
  return <LandingPage />;
}