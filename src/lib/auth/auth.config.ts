// src/lib/auth/auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

// --- Define paths here or import from a shared constants file ---
const protectedPaths = [
    '/dashboard',
    '/warehouse',
    '/customers',
    '/orders',
];
const publicOnlyPaths = [ '/login', '/signup' ];
// -----------------------------------------------------------------

export const authConfig = {
    providers: [
        // Define Credentials provider structure, but WITHOUT the authorize function
        // The actual authorization logic will be in the main auth.ts
        Credentials({
            // You might optionally add fields here if you want NextAuth to generate a basic form
            // fields: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
            // authorize function is intentionally omitted here for Edge compatibility
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/error", // Optional: Error page
        signOut: "/",    // Optional: Redirect after sign out
    },
    session: {
        strategy: "jwt", // IMPORTANT: Force JWT strategy for Edge middleware
        maxAge: 60 * 60 * 24, // 1 day (optional)
    },
    callbacks: {
        // --- AUTHORIZED CALLBACK (Edge-Compatible) ---
        // This runs in the middleware. It checks the JWT session.
        async authorized({ auth, request }) {
            const { pathname, search } = request.nextUrl;
            const isLoggedIn = !!auth?.user; // Check if user JWT is valid

            const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
            const isPublicOnly = publicOnlyPaths.some((path) => pathname.startsWith(path));

            // 1. If trying to access a protected route and not logged in
            if (isProtected && !isLoggedIn) {
                const loginUrl = new URL('/login', request.url);
                const callbackPath = pathname + search;
                loginUrl.searchParams.set('callbackUrl', callbackPath);
                console.log(`[Auth Config - authorized] Unauthorized access to "${pathname}". Redirecting to: ${loginUrl.toString()}`);
                return NextResponse.redirect(loginUrl); // Redirect to login with callback
            }

            // 2. If trying to access a public-only route (like /login) *while* logged in
            if (isPublicOnly && isLoggedIn) {
                console.log(`[Auth Config - authorized] Logged-in user accessing "${pathname}". Redirecting to dashboard.`);
                const dashboardUrl = new URL('/dashboard', request.url);
                return NextResponse.redirect(dashboardUrl); // Redirect logged-in users away
            }

            // 3. Allow access in all other cases
            return true;
        },

        // --- JWT/Session Callbacks (Can be defined here or in main auth.ts) ---
        // These run when the JWT/session is created/updated, typically NOT in the middleware edge runtime.
        // It's often cleaner to keep them with the main auth.ts if they relate to user data population.
        // We will move them to auth.ts for clarity.
    },
    // Add other Edge-compatible options if needed (e.g., trustHost)
} satisfies NextAuthConfig;
