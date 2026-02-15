import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url)
        const code = searchParams.get('code')
        // if "next" is in param, use it
        const next = searchParams.get('next') ?? '/dashboard'

        console.log("Auth Callback Triggered.");
        console.log("  URL:", request.url);
        console.log("  Next Param:", next);
        console.log("  Code Present:", !!code);

        if (code) {
            const supabase = await createClient()
            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (!error) {
                const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
                const isLocalEnv = process.env.NODE_ENV === 'development'

                console.log("  Exchange Success. Redirecting to:", next);

                if (isLocalEnv) {
                    // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                    return NextResponse.redirect(`${origin}${next}`)
                } else if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}${next}`)
                } else {
                    return NextResponse.redirect(`${origin}${next}`)
                }
            } else {
                console.error("Auth Error exchanging code:", error)
                return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
            }
        }
    } catch (error: any) {
        console.error("Auth Callback Exception:", error);
        const { origin } = new URL(request.url)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=UnexpectedError`);
    }

    // return the user to an error page with instructions
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=NoCodeProvided`)
}
