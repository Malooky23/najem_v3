import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header/page";

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
      <Providers>
        <body className={`${inter.className} h-full bg-gray-50`}>

            <div className="h-full flex flex-col">
              <Header />
              <div className="flex-1 pt-12">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
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
