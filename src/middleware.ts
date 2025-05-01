// // import { NextResponse } from "next/server";
// // import type { NextRequest } from "next/server";
// // import { getToken } from "next-auth/jwt";

// // // Paths that don't require authentication
// // const publicPaths = ["/login", "/signup", "/api/auth"] 

// // // Protected route patterns
// // const protectedRoutes = ["/protected", "/dashboard", "/admin", "/customers", "/warehouse" ]; // ADD '/customers' and '/warehouse/items' here to protect page routes

// // export async function middleware(request: NextRequest) {



// //   return NextResponse.next();
// // }

// // // Configure which routes to run middleware on
// // export const config = {
// //   matcher: [
// //     /*
// //      * Match all request paths except for the ones starting with:
// //      * - _next/static (static files)
// //      * - _next/image (image optimization files)
// //      * - favicon.ico (favicon file)
// //      */
// //     "/((?!_next/static|_next/image|favicon.ico).*)",
// //   ],
// // };
// // import { NextResponse } from "next/server";
// // import NextAuth from 'next-auth';

// // import { auth } from "@/lib/auth/auth"
 
// // const publicPaths = ["/login", "/signup", "/api/auth"] 

// // export default auth((req) => {
// //     const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));

// //   if (!req.auth && isPublicPath) {
// //     return NextResponse.next();
// // }
// //   if (!req.auth && req.nextUrl.pathname !== "/login") {
// //     const newUrl = new URL("/", req.nextUrl.origin)
// //     return NextResponse.redirect(newUrl)
// //   }
// // })

// // const publicPaths = ["/login", "/signup", "/api/auth"];

// // export default auth((req) => {
// //   const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));

// //   if (isPublicPath) {
// //     return true; // Allow access to public paths
// //   }

// //   if (!req.auth && req.nextUrl.pathname !== "/login") {
// //     const newUrl = new URL("/", req.nextUrl.origin);
// //     return Response.redirect(newUrl);
// //   }

// //   return true; // Allow access for authenticated users or public paths
// // });

// // export const config = {
// //   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// //   runtime: 'nodejs',   // <-- Explicitly set runtime to 'nodejs'

// // };

// // import { auth } from "@/lib/auth/auth"
 
// // export default auth((req) => {
// //   if (!req.auth && req.nextUrl.pathname !== "/login") {
// //     const newUrl = new URL("/", req.nextUrl.origin)
// //     return Response.redirect(newUrl)
// //   }
// // })

// // import NextAuth from "next-auth"
// // import authConfig from "./lib/auth/auth.config"
 
// // export const { auth: middleware } = NextAuth(authConfig)

// // middleware.ts (or src/middleware.ts)
// import { NextResponse } from 'next/server'

// import { auth } from "@/auth"
// import NextAuth from 'next-auth';

// // Define paths that require authentication
// const protectedPaths = [
//     '/dashboard',
//     '/warehouse', // Protects /warehouse and all sub-paths like /warehouse/items
//     '/customers',
//     // Add other protected routes here
// ];

// // Define paths that should be accessible only when logged out (e.g., login, signup)
// const publicOnlyPaths = [ '/login', '/signup' ];

// const publicPaths = [ "/login", "/signup", "/api/auth" ]

// export default auth((req) => {
//     const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
//     const pathname = req.nextUrl.pathname;

//     if (!req.auth && isPublicPath) {
//         return NextResponse.next();
//     }
//     if (!req.auth && req.nextUrl.pathname !== "/login") {
//         // const newUrl = new URL("/", req.nextUrl.origin)
//         // return NextResponse.redirect(newUrl)
//         const loginUrl = new URL('/login', req.url); // Use request.url to preserve host, port, protocol
//         loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search); // Include original search params too

//         // Redirect to the login page
//         return NextResponse.redirect(loginUrl);

//     }
// })



// // export async function middleware(request: NextRequest) {
// //     const session = await auth(); // Get session info
// //     const pathname = request.nextUrl.pathname;

// //     const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
// //     const isPublicOnly = publicOnlyPaths.some((path) => pathname.startsWith(path));

// //     // 1. If trying to access a protected route without a session
// //     if (isProtected && !session?.user) {
// //         // Construct the login URL with the callbackUrl
// //         const loginUrl = new URL('/login', request.url); // Use request.url to preserve host, port, protocol
// //         loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search); // Include original search params too

// //         // Redirect to the login page
// //         return NextResponse.redirect(loginUrl);
// //     }

// //     // 2. If trying to access a public-only route (like /login) *with* a session
// //     if (isPublicOnly && session?.user) {
// //         // Redirect logged-in users away from login/signup to the dashboard
// //         const dashboardUrl = new URL('/dashboard', request.url);
// //         return NextResponse.redirect(dashboardUrl);
// //     }

// //     // 3. Allow the request to proceed if none of the above conditions are met
// //     return NextResponse.next();
// // }

// // Configure the middleware to run on specific paths
// export const config = {
//     matcher: [
//         /*
//          * Match all request paths except for the ones starting with:
//          * - api (API routes)
//          * - _next/static (static files)
//          * - _next/image (image optimization files)
//          * - favicon.ico (favicon file)
//          * - images (public images folder) - adjust if your public assets folder is different
//          */
//         '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
//     ],
// }


// export {auth as middleware} from '@/lib/auth/auth'
// src/middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config'; // Import the Edge-compatible config

// Initialize NextAuth with the Edge-compatible configuration
// The `auth` helper here will rely on the JWT strategy defined in authConfig
// export const { auth: middleware } = NextAuth(authConfig);

const { auth } = NextAuth(authConfig); // Get the auth function from the initialized NextAuth

// Export the auth function as the default export for the middleware
export default auth;
// --- IMPORTANT: REMOVE runtime export ---
// export const runtime = 'nodejs'; // Remove this line!

// Configure the middleware matcher (keep your existing matcher)
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public assets)
         * - assets (public assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)',
    ],
};
