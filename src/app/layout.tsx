import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header/page";
import Loading from "@/components/ui/loading";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Najem Aleen Shipping",
  description: "Shipping and Logistics Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      {/* <meta name="viewport" 
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/> */}

      <Providers>
        <body className={`${inter.className} h-full bg-gray-50`}>
          <div className="h-full flex flex-col">
            <Header />
            <div className="flex-1 mt-12">
              <Suspense fallback={
                <div className="flex items-center justify-center w-full h-full">
                  <Loading />
                </div>
              }>
                {children}
              </Suspense>
            </div>
            <Toaster />
          </div>
        </body>
      </Providers>
    </html>
  );
}