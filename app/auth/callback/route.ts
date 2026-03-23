import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/feed'
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        await supabase.auth.exchangeCodeForSession(code)
    }

    // If `next` is provided (e.g., /reset-password), redirect there.
    // Otherwise, redirect to /feed (middleware handles onboarding check).
    return NextResponse.redirect(`${origin}${next}`)
}
