import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // 1. Define the protected paths
    const publicPaths = ['/about', '/features', '/contact', '/privacy', '/terms', '/login', '/auth', '/register', '/public'];
    const isPublic = publicPaths.some(path => request.nextUrl.pathname.startsWith(path)) || request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/lp/');

    // 2. Check for Supabase session cookie
    // The cookie name pattern is usually `sb-<project-ref>-auth-token`
    // We check for *any* cookie starting with `sb-` and ending with `-auth-token` OR standard `sb-access-token`
    const hasSession = request.cookies.getAll().some(cookie =>
        (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) ||
        cookie.name === 'sb-access-token'
    );

    // 3. Auth Protection Logic
    if (!hasSession && !isPublic) {
        // No session cookie found on a protected route
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 4. Continue
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
