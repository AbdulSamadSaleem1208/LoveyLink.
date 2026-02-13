import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    // Create a response object that we can pass to the client
    const res = NextResponse.next()

    // Create the Supabase client
    // Note: createMiddlewareClient handles cookies automatically
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if needed
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Auth Protection Logic
    if (
        !session &&
        !req.nextUrl.pathname.startsWith('/login') &&
        !req.nextUrl.pathname.startsWith('/auth') &&
        !req.nextUrl.pathname.startsWith('/register') &&
        !req.nextUrl.pathname.startsWith('/public') &&
        req.nextUrl.pathname !== '/'
    ) {
        // no user, potentially redirect to login
        // BUT we have public pages like /features, /about, /contact
        const publicPaths = ['/about', '/features', '/contact', '/privacy', '/terms'];
        if (!publicPaths.includes(req.nextUrl.pathname) && !req.nextUrl.pathname.startsWith('/lp/')) {
            const url = req.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return res
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
