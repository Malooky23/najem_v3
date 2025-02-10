import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that don't require authentication
const publicPaths = ["/login", "/signup", "/api/auth"];

// Protected route patterns
const protectedRoutes = ["/protected", "/dashboard", "/admin", "/customers"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware processing path:', pathname);

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    //console.log('Public path detected:', pathname);
    return NextResponse.next();
  }

  // Check if it's a protected page route
  const isProtectedPage = protectedRoutes.some((route) => pathname.startsWith(route));
  
  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  // If it's a protected page and no token exists, redirect to login
  if (isProtectedPage && !token) {
    console.log('Protected page detected:', pathname);
    console.log("Token", token)
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Handle API routes
  if (pathname.startsWith("/api")) {
    //console.log('API route detected:', pathname);
    try {
      const isVercel = process.env.VERCEL === '1';
      //console.log('Environment:', isVercel ? 'Vercel' : 'Local');
      
      // // Log environment variables
      //console.log('Environment variables:', {
      //   NEXTAUTH_SECRET: maskSecret(process.env.NEXTAUTH_SECRET),
      //   AUTH_SECRET: maskSecret(process.env.AUTH_SECRET),
      //   NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      // });
      
      // Get all cookies

      
      // Get specific tokens
      const sessionToken = request.cookies.get('__Secure-authjs.session-token')?.value;
      const vercelJwt = request.cookies.get('_vercel_jwt')?.value;
      
      //console.log('Token values:', {
      //   sessionToken: maskSecret(sessionToken),
      //   vercelJwt: maskSecret(vercelJwt)
      // });

      // Set NEXTAUTH_URL if not defined
      if (!process.env.NEXTAUTH_URL) {
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host') || '';
        process.env.NEXTAUTH_URL = `${protocol}://${host}`;
        //console.log('Set NEXTAUTH_URL to:', process.env.NEXTAUTH_URL);
      }

      // Try with session token first
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
      });

      // If NextAuth token is valid, proceed
      if (token) {


        //console.log('Valid NextAuth token found:', {
        //   email: token.email,
        //   name: token.name,
        //   exp: token.exp ? new Date(token.exp * 1000).toISOString() : undefined
        // });


        return NextResponse.next();
      }

      // If no NextAuth token but Vercel JWT exists, validate it
      if (vercelJwt) {
        try {
          // Basic validation - check if it's a valid JWT format
          const [header, payload, signature] = vercelJwt.split('.');
          if (header && payload && signature) {
            // Decode the payload
            const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
            
            // Validate the token hasn't expired
            const exp = decodedPayload.iat + (24 * 60 * 60); // Assuming 24h expiry from iat
            const now = Math.floor(Date.now() / 1000);
            
            if (exp > now) {
              //console.log('Valid Vercel JWT found:', {
              //   userId: decodedPayload.userId,
              //   username: decodedPayload.username,
              //   iat: new Date(decodedPayload.iat * 1000).toISOString(),
              //   exp: new Date(exp * 1000).toISOString()
              // });

              
              return NextResponse.next();
            } else {
              //console.log('Vercel JWT has expired');
            }
          }
        } catch (error) {
          console.error('Error validating Vercel JWT:', error);
        }
      }

      // No valid token found
      //console.log('No valid token found for path:', pathname);
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error('Error in middleware: here', error);
      return new NextResponse(
        JSON.stringify({ 
          error: "Internal server error in auth middleware",
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
