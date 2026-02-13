import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    try {
        // Validate Environment Variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Middleware Error: Missing Supabase Environment Variables');
            return NextResponse.next();
        }

        let supabaseResponse = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        let supabase;
        try {
            supabase = createServerClient(
                supabaseUrl,
                supabaseKey,
                {
                    cookies: {
                        getAll() {
                            return request.cookies.getAll()
                        },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                request.cookies.set(name, value)
                            )
                            supabaseResponse = NextResponse.next({
                                request: {
                                    headers: request.headers,
                                },
                            })
                            cookiesToSet.forEach(({ name, value, options }) =>
                                supabaseResponse.cookies.set(name, value, options)
                            )
                        },
                    },
                }
            )
        } catch (err) {
            console.error('Middleware Error: Failed to create Supabase client:', err);
            return NextResponse.next();
        }

        // Do not run on static files
        if (request.nextUrl.pathname.startsWith('/_next') ||
            request.nextUrl.pathname.includes('.')) {
            return supabaseResponse;
        }

        try {
            const {
                data: { user },
                error: userError
            } = await supabase.auth.getUser()

            if (userError) {
                // Log but don't crash, might be just no session
                // console.warn('Middleware Auth Check: No active session or error:', userError.message);
            }

            if (
                !user &&
                !request.nextUrl.pathname.startsWith('/login') &&
                !request.nextUrl.pathname.startsWith('/auth') &&
                !request.nextUrl.pathname.startsWith('/register') &&
                !request.nextUrl.pathname.startsWith('/public') &&
                request.nextUrl.pathname !== '/'
            ) {
                // no user, potentially redirect to login
                // BUT we have public pages like /features, /about, /contact
                const publicPaths = ['/about', '/features', '/contact', '/privacy', '/terms'];
                if (!publicPaths.includes(request.nextUrl.pathname) && !request.nextUrl.pathname.startsWith('/lp/')) {
                    const url = request.nextUrl.clone()
                    url.pathname = '/login'
                    return NextResponse.redirect(url)
                }
            }
        } catch (authErr) {
            console.error('Middleware Error: Auth check failed:', authErr);
            // Allow request to proceed if auth check fails abruptly
            return supabaseResponse;
        }

        return supabaseResponse
    } catch (e) {
        console.error('CRITICAL Middleware execution failed:', e);
        // Fallback: Allow request to continue if middleware fails
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
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
