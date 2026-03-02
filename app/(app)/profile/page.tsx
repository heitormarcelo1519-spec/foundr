import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lightbulb, Rocket, MessageCircle } from 'lucide-react'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: ideas } = await supabase
        .from('ideas')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    const { data: applications } = await supabase
        .from('applications')
        .select(`*, ideas(id, title)`)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false })

    if (!profile) redirect('/login')

    const statusBadge = {
        pending: <Badge variant="warning">Pendente</Badge>,
        accepted: <Badge variant="success">Aceito ✓</Badge>,
        rejected: <Badge variant="destructive">Recusado</Badge>,
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Profile header */}
            <Card className="bg-card/50 backdrop-blur-sm glow">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-5">
                        <Avatar className="w-20 h-20 ring-4 ring-violet-500/30">
                            <AvatarImage src={profile.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xl">{getInitials(profile.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                            <p className="text-muted-foreground text-sm">{user.email}</p>

                            {profile.categories && profile.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {profile.categories.map((cat: string) => (
                                        <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                                    ))}
                                </div>
                            )}

                            {profile.bio_summary && (
                                <div className="mt-4 p-3 rounded-xl bg-violet-500/8 border border-violet-500/20 text-sm leading-relaxed whitespace-pre-line">
                                    {profile.bio_summary}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* My ideas */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-violet-400" />
                        Meus Projetos
                        <Badge variant="outline">{ideas?.length ?? 0}/2</Badge>
                    </h2>
                    {(ideas?.length ?? 0) < 2 && (
                        <Link href="/ideas/new">
                            <Button size="sm" className="gap-2">
                                <Rocket className="w-3.5 h-3.5" />
                                Novo Projeto
                            </Button>
                        </Link>
                    )}
                </div>

                {ideas && ideas.length > 0 ? (
                    <div className="space-y-3">
                        {ideas.map(idea => (
                            <Link key={idea.id} href={`/ideas/${idea.id}`}>
                                <Card className="bg-card/50 hover:border-violet-500/50 transition-all cursor-pointer group">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold group-hover:text-violet-300 transition-colors">{idea.title}</h3>
                                            <Badge variant={idea.is_active ? 'success' : 'secondary'}>
                                                {idea.is_active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{formatRelativeTime(idea.created_at)}</p>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {(idea.needed_skills ?? []).slice(0, 4).map((s: string) => (
                                                <Badge key={s} variant="default" className="text-xs">{s}</Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-card/50">
                        <CardContent className="flex flex-col items-center py-10 text-center">
                            <Lightbulb className="w-10 h-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground text-sm">Você ainda não lançou nenhum projeto.</p>
                            <Link href="/ideas/new" className="mt-3">
                                <Button size="sm" className="gap-2">
                                    <Rocket className="w-3.5 h-3.5" />
                                    Lançar projeto
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* My applications */}
            <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-violet-400" />
                    Minhas Candidaturas
                </h2>

                {applications && applications.length > 0 ? (
                    <div className="space-y-3">
                        {applications.map(app => {
                            const idea = app.ideas as { id: string; title: string } | null
                            return (
                                <Link key={app.id} href={idea ? `/ideas/${idea.id}` : '#'}>
                                    <Card className="bg-card/50 hover:border-violet-500/50 transition-all cursor-pointer">
                                        <CardContent className="py-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">{idea?.title ?? 'Projeto'}</p>
                                                <p className="text-xs text-muted-foreground">{formatRelativeTime(app.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {statusBadge[app.status as 'pending' | 'accepted' | 'rejected']}
                                                {app.status === 'accepted' && idea && (
                                                    <Link href={`/chat/${idea.id}`} onClick={e => e.stopPropagation()}>
                                                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 border-emerald-500/50 text-emerald-400">
                                                            💬 Chat
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <Card className="bg-card/50">
                        <CardContent className="flex items-center justify-center py-10 text-center">
                            <p className="text-muted-foreground text-sm">Você ainda não se candidatou a nenhum projeto.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
