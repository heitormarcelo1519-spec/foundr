import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import ApplyModal from '@/components/ApplyModal'
import { Calendar, Users, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface Props {
    params: Promise<{ id: string }>
}

export default async function IdeaDetailPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: idea, error } = await supabase
        .from('ideas')
        .select(`*, profiles(*)`)
        .eq('id', id)
        .single()

    if (error || !idea) return notFound()

    const owner = idea.profiles as {
        id: string; full_name: string | null; avatar_url: string | null;
        bio_summary: string | null; categories: string[] | null;
    }

    const isOwner = user?.id === owner.id

    // Check if current user has already applied
    let existingApplication = null
    if (user && !isOwner) {
        const { data } = await supabase
            .from('applications')
            .select('status')
            .eq('idea_id', id)
            .eq('applicant_id', user.id)
            .single()
        existingApplication = data
    }

    // Check if user is accepted (to show chat link)
    const isAccepted = existingApplication?.status === 'accepted' || isOwner

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back */}
            <Link href="/feed" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-6">
                ← Voltar ao Feed
            </Link>

            <div className="grid gap-6">
                {/* Idea details */}
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="w-5 h-5 text-violet-400" />
                                    <span className="text-sm text-violet-400 font-medium">Projeto em busca de talentos</span>
                                </div>
                                <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>
                                <p className="text-muted-foreground text-sm flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Publicado {formatRelativeTime(idea.created_at)}
                                </p>
                            </div>
                            {isAccepted && (
                                <Link href={`/chat/${idea.id}`}>
                                    <Button id="open-chat-btn" variant="outline" size="sm" className="gap-2 border-emerald-500/50 text-emerald-400 hover:border-emerald-500">
                                        💬 Chat do grupo
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Sobre o projeto</h3>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                        </div>

                        {/* Skills needed */}
                        {(idea.needed_skills ?? []).length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Habilidades buscadas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(idea.needed_skills ?? []).map((skill: string) => (
                                        <Badge key={skill} variant="default">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Creator profile */}
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Criado por</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Avatar className="w-14 h-14">
                                <AvatarImage src={owner.avatar_url ?? undefined} />
                                <AvatarFallback className="text-sm">{getInitials(owner.full_name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold">{owner.full_name}</h2>
                                {owner.categories && owner.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {owner.categories.slice(0, 4).map((cat: string) => (
                                            <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                                        ))}
                                        {owner.categories.length > 4 && (
                                            <Badge variant="outline" className="text-xs">+{owner.categories.length - 4}</Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {owner.bio_summary && (
                            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                                <p className="text-sm font-semibold text-violet-300 mb-1.5 flex items-center gap-1.5">
                                    ✨ Bio resumida por IA
                                </p>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                                    {owner.bio_summary}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Apply section */}
                {!isOwner && user && (
                    <ApplyModal
                        ideaId={id}
                        userId={user.id}
                        existingApplication={existingApplication}
                    />
                )}
            </div>
        </div>
    )
}
