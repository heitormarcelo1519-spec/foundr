'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { Profile } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { Lightbulb, Bell, LogOut, Rocket } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AppNavProps {
    user: User
    profile: Profile
}

export default function AppNav({ user, profile }: AppNavProps) {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [notifCount, setNotifCount] = useState(0)

    useEffect(() => {
        const fetchNotifications = async () => {
            // Count pending applications on user's ideas
            const { count } = await supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'pending')
                .in('idea_id',
                    (await supabase
                        .from('ideas')
                        .select('id')
                        .eq('owner_id', user.id)
                        .then(r => r.data?.map(i => i.id) ?? []))
                )
            setNotifCount(count ?? 0)
        }
        fetchNotifications()
    }, [pathname])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const navItems = [
        { href: '/feed', label: 'Feed', icon: Lightbulb },
        { href: '/notifications', label: 'Notificações', icon: Bell, badge: notifCount },
    ]

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/feed" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg gradient-text">Foundr</span>
                    </Link>

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

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <Link href="/ideas/new">
                            <Button id="launch-idea-btn" size="sm" className="gap-2 hidden sm:flex">
                                <Rocket className="w-3.5 h-3.5" />
                                Lançar Projeto
                            </Button>
                        </Link>

                        <Link href="/profile">
                            <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all">
                                <AvatarImage src={profile.avatar_url ?? undefined} />
                                <AvatarFallback className="text-xs">{getInitials(profile.full_name)}</AvatarFallback>
                            </Avatar>
                        </Link>

                        <Button
                            id="signout-btn"
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
