import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Public routes that don't need auth
    const publicRoutes = ['/login', '/auth/callback', '/forgot-password', '/reset-password', '/termos', '/planos']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // If not logged in and not on a public route → redirect to login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If logged in and on login page → redirect to feed
    if (user && pathname === '/login') {
        const url = request.nextUrl.clone()
        url.pathname = '/feed'
        return NextResponse.redirect(url)
    }

    // If logged in but not onboarded → redirect to onboarding (unless already there)
    if (user && !pathname.startsWith('/onboarding') && !isPublicRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_onboarded')
            .eq('id', user.id)
            .single()

        if (profile && !profile.is_onboarded) {
            const url = request.nextUrl.clone()
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }
    }

    // If logged in and onboarded, can't visit onboarding
    if (user && pathname.startsWith('/onboarding')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_onboarded')
            .eq('id', user.id)
            .single()

        if (profile?.is_onboarded) {
            const url = request.nextUrl.clone()
            url.pathname = '/feed'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
