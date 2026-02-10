import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    console.log("Auth Callback Triggered. URL:", request.url);
    console.log("Code present:", !!code);

    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                redirect(`https://${forwardedHost}${next}`)
            } else {
                redirect(`${origin}${next}`)
            }
        } else {
            console.error("Auth Error exchanging code:", error)
        }
    }

    // return the user to an error page with instructions
    // We use NextResponse.redirect here because 'redirect' throws and we might want to return a specific response if needed, 
    // but practically redirect() is fine here too.
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
