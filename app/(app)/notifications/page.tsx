import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import NotificationActions from '@/components/NotificationActions'
import { Bell, Inbox } from 'lucide-react'

export default async function NotificationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get user's ideas
    const { data: myIdeas } = await supabase
        .from('ideas')
        .select('id, title')
        .eq('owner_id', user.id)
        .eq('is_active', true)

    const ideaIds = (myIdeas ?? []).map(i => i.id)

    // Get all applications for user's ideas
    const { data: applications } = ideaIds.length > 0
        ? await supabase
            .from('applications')
            .select(`*, profiles(*), ideas(id, title)`)
            .in('idea_id', ideaIds)
            .order('created_at', { ascending: false })
        : { data: [] }

    const pending = (applications ?? []).filter(a => a.status === 'pending')
    const reviewed = (applications ?? []).filter(a => a.status !== 'pending')

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Notificações</h1>
                    <p className="text-muted-foreground text-sm">
                        {pending.length} candidatura{pending.length !== 1 ? 's' : ''} pendente{pending.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {applications?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Nenhuma candidatura</h3>
                    <p className="text-muted-foreground">Quando alguém se candidatar à suas ideias, aparecerá aqui.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {pending.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Pendentes ({pending.length})
                            </h2>
                            {pending.map(app => (
                                <ApplicationCard key={app.id} app={app} />
                            ))}
                        </div>
                    )}
                    {reviewed.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Analisadas ({reviewed.length})
                            </h2>
                            {reviewed.map(app => (
                                <ApplicationCard key={app.id} app={app} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function ApplicationCard({ app }: { app: Record<string, unknown> }) {
    const profile = app.profiles as { full_name: string | null; avatar_url: string | null }
    const idea = app.ideas as { id: string; title: string }
    const status = app.status as 'pending' | 'accepted' | 'rejected'
    const statusMap = {
        pending: { label: 'Pendente', variant: 'warning' as const },
        accepted: { label: 'Aceito', variant: 'success' as const },
        rejected: { label: 'Recusado', variant: 'destructive' as const },
    }

    return (
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={profile.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs">{getInitials(profile.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{profile.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                                → <span className="text-violet-400">{idea.title}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {formatRelativeTime(app.created_at as string)}
                            </p>
                        </div>
                    </div>
                    <Badge variant={statusMap[status].variant}>{statusMap[status].label}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-secondary text-sm text-foreground leading-relaxed">
                    {app.message as string}
                </div>
                {status === 'pending' && (
                    <NotificationActions applicationId={app.id as string} applicantId={app.applicant_id as string} ideaId={idea.id} />
                )}
            </CardContent>
        </Card>
    )
}
