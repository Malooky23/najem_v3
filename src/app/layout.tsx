import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Loading from "@/components/ui/loading";
import { SpeedInsights } from '@vercel/speed-insights/next';

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} h-full bg-gradient-to-br from-blue-200/80 via-purple-200/80 to-amber-200/50`}>
        <Providers>
          <div className="h-full flex flex-col">
            <div className="flex-1">
              {/* <Suspense fallback={
                <div className="flex items-center bg-red-500 justify-center w-full h-full">
                  <Loading />
                </div>
              }> */}
              <Suspense >
                {children}
                <SpeedInsights />
              </Suspense>
            </div>
            <Toaster />
            <Sonner richColors />
          </div>
        </Providers>
      </body>
    </html>
  );
}

