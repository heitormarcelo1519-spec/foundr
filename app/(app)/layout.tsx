import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNav from '@/components/AppNav'
import { Toaster } from '@/components/ui/toaster'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile?.is_onboarded) redirect('/onboarding')

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppNav user={user} profile={profile} />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {children}
            </main>
            <Toaster />
        </div>
    )
}
