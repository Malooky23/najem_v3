import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          Najem Aleen Shipping
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Shipping and Logistics Management System
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
