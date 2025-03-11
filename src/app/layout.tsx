import { Monitoring } from "react-scan/monitoring/next"; // Import this first before React

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header/page";
import Loading from "@/components/ui/loading";
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from "next/script";

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
    <html lang="en" className="h-full ">
      {/* <meta name="viewport" 
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/> */}
      <head>
        {/* other head tags */}
        <Script
          src="https://unpkg.com/react-scan/dist/install-hook.global.js"
          strategy="beforeInteractive"
        />
      </head>
      <Providers>
        <body className={`${inter.className} h-full bg-gray-50 text-black`}>
        {/* <body className={`${inter.className} h-full bg-gradient-to-br from-blue-200/80 via-purple-200/80 to-amber-200/50`}> */}
          <div className="h-full flex flex-col">
          <Monitoring
          apiKey="kxtTdYFl7GFUoMIWEzU-mJE9aeddue7M" // Safe to expose publically
          url="https://monitoring.react-scan.com/api/v1/ingest"
          commit={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA} // optional but recommended
          branch={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF} // optional but recommended
        />

            {/* <Header /> */}
            {/* <div className="flex-1 mt-12"> */}
            <div className="flex-1">
              <Suspense fallback={
                <div className="flex items-center justify-center w-full h-full">
                  <Loading />
                </div>
              }>
                {children}
                <SpeedInsights />
              </Suspense>
            </div>
            <Toaster />
            <Sonner richColors/> 
          </div>
        </body>
      </Providers>
    </html>
  );
}

