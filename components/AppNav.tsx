'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Lightbulb, Bell, LogOut, Rocket, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AppNav() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const { user, profile, loading } = useAuth()
    const [notifCount, setNotifCount] = useState(0)

    useEffect(() => {
        if (!user) return
        const fetchNotifications = async () => {
            const { count } = await supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'pending')
                .in('idea_id',
                    (await supabase
                        .from('ideas')
                        .select('id')
                        .eq('owner_id', user.id)
                        .then((r: { data: { id: string }[] | null }) => r.data?.map((i: { id: string }) => i.id) ?? []))
                )
            setNotifCount(count ?? 0)
        }
        fetchNotifications()
    }, [pathname, user]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const navItems = [
        { href: '/feed', label: 'Feed', icon: Lightbulb },
        { href: '/notifications', label: 'Notificações', icon: Bell, badge: notifCount },
    ]

    // Show skeleton while auth state loads
    if (loading) {
        return (
            <nav className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-secondary animate-pulse" />
                            <div className="w-16 h-5 rounded bg-secondary animate-pulse" />
                        </div>
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={user ? '/feed' : '/'} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                                <path d="M12 2C12 2 8 6 8 12H16C16 6 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 12L6 17H18L16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 17V20M14 17V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="12" cy="9" r="1.5" fill="currentColor" />
                            </svg>
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-white">Foundr</span>
                    </Link>

                    {user ? (
                        <>
                            {/* Nav links */}
                            <div className="hidden sm:flex items-center gap-1">
                                {navItems.map(item => (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className="gap-2 relative"
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                            {item.badge && item.badge > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center font-bold">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Button>
                                    </Link>
                                ))}
                            </div>

                            {/* Right side — authenticated */}
                            <div className="flex items-center gap-3">
                                <Link href="/ideas/new">
                                    <Button id="launch-idea-btn" size="sm" className="gap-2 hidden sm:flex">
                                        <Rocket className="w-3.5 h-3.5" />
                                        Lançar Projeto
                                    </Button>
                                </Link>

                                <Link href="/profile">
                                    <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all">
                                        <AvatarImage src={profile?.avatar_url ?? undefined} />
                                        <AvatarFallback className="text-xs">
                                            {getInitials(profile?.full_name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>

                                <Button
                                    id="signout-btn"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleSignOut}
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Sair da conta"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        /* Right side — unauthenticated */
                        <div className="flex items-center gap-3">
                            <Link href="/planos">
                                <Button variant="ghost" size="sm">Ver planos</Button>
                            </Link>
                            <Link href="/login">
                                <Button id="create-account-btn" size="sm">Criar conta</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
