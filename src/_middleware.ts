// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// // Paths that don't require authentication
// const publicPaths = ["/login", "/signup", "/api/auth"] 

// // Protected route patterns
// const protectedRoutes = ["/protected", "/dashboard", "/admin", "/customers", "/warehouse" ]; // ADD '/customers' and '/warehouse/items' here to protect page routes

// export async function middleware(request: NextRequest) {



//   return NextResponse.next();
// }

// // Configure which routes to run middleware on
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//   ],
// };
// import { NextResponse } from "next/server";
// import NextAuth from 'next-auth';

// import { auth } from "@/lib/auth/auth"
 
// const publicPaths = ["/login", "/signup", "/api/auth"] 

// export default auth((req) => {
//     const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));

//   if (!req.auth && isPublicPath) {
//     return NextResponse.next();
// }
//   if (!req.auth && req.nextUrl.pathname !== "/login") {
//     const newUrl = new URL("/", req.nextUrl.origin)
//     return NextResponse.redirect(newUrl)
//   }
// })

// const publicPaths = ["/login", "/signup", "/api/auth"];

// export default auth((req) => {
//   const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));

//   if (isPublicPath) {
//     return true; // Allow access to public paths
//   }

//   if (!req.auth && req.nextUrl.pathname !== "/login") {
//     const newUrl = new URL("/", req.nextUrl.origin);
//     return Response.redirect(newUrl);
//   }

//   return true; // Allow access for authenticated users or public paths
// });

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
//   runtime: 'nodejs',   // <-- Explicitly set runtime to 'nodejs'

// };

// import { auth } from "@/lib/auth/auth"
 
// export default auth((req) => {
//   if (!req.auth && req.nextUrl.pathname !== "/login") {
//     const newUrl = new URL("/", req.nextUrl.origin)
//     return Response.redirect(newUrl)
//   }
// })

// import NextAuth from "next-auth"
// import authConfig from "./lib/auth/auth.config"
 
// export const { auth: middleware } = NextAuth(authConfig)