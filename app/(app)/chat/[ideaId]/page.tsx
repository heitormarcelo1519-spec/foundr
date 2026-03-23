'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { MessageWithSender, Profile } from '@/types/database'
import { Send, Loader2, ArrowLeft, Lock, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function ChatPage() {
    const params = useParams()
    const router = useRouter()
    const ideaId = params.ideaId as string
    const supabase = createClient()

    const [messages, setMessages] = useState<MessageWithSender[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [access, setAccess] = useState<'allowed' | 'denied' | 'checking'>('checking')
    const [idea, setIdea] = useState<{ title: string } | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }
            setCurrentUserId(user.id)

            // Check access: owner or accepted applicant
            const { data: rawIdea } = await supabase
                .from('ideas')
                .select('title, owner_id')
                .eq('id', ideaId)
                .single()

            const ideaData = rawIdea as { title: string; owner_id: string } | null

            if (!ideaData) { setAccess('denied'); setLoading(false); return }
            setIdea({ title: ideaData.title })

            const isOwner = ideaData.owner_id === user.id
            if (!isOwner) {
                const { data: app } = await supabase
                    .from('applications')
                    .select('status')
                    .eq('idea_id', ideaId)
                    .eq('applicant_id', user.id)
                    .eq('status', 'accepted')
                    .single()

                if (!app) { setAccess('denied'); setLoading(false); return }
            }

            setAccess('allowed')

            // Load messages
            const { data: msgs } = await supabase
                .from('messages')
                .select(`*, profiles(*)`)
                .eq('idea_id', ideaId)
                .order('created_at', { ascending: true })

            setMessages((msgs as MessageWithSender[]) ?? [])
            setLoading(false)

            // Realtime subscription
            const channel = supabase
                .channel(`chat-${ideaId}`)
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages', filter: `idea_id=eq.${ideaId}` },
                    async (payload) => {
                        const { data: msgWithProfile } = await supabase
                            .from('messages')
                            .select(`*, profiles(*)`)
                            .eq('id', payload.new.id)
                            .single()
                        if (msgWithProfile) {
                            setMessages(prev => [...prev, msgWithProfile as MessageWithSender])
                        }
                    }
                )
                .subscribe()

            return () => { supabase.removeChannel(channel) }
        }

        init()
    }, [ideaId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!newMessage.trim() || !currentUserId) return
        setSending(true)
        const content = newMessage.trim()
        setNewMessage('')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('messages') as any).insert({
            idea_id: ideaId,
            sender_id: currentUserId,
            content,
        })

        if (error) {
            console.error('Send error:', error)
            setNewMessage(content)
        }
        setSending(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (access === 'checking' || loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (access === 'denied') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">Acesso restrito</h2>
                <p className="text-muted-foreground">Apenas membros aceitos deste projeto podem acessar o chat.</p>
                <Link href="/feed">
                    <Button variant="outline">Voltar ao Feed</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            {/* Chat header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <Link href={`/ideas/${ideaId}`}>
                    <Button variant="ghost" size="icon" className="shrink-0">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                    <h1 className="font-bold text-sm leading-none">{idea?.title}</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Chat do Grupo</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {messages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                    </div>
                )}
                {messages.map(msg => {
                    const isMe = msg.sender_id === currentUserId
                    const profile = msg.profiles as Profile

                    return (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {!isMe && (
                                <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                                    <AvatarFallback className="text-xs">{getInitials(profile.full_name)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                {!isMe && (
                                    <span className="text-xs text-muted-foreground ml-1">{profile.full_name}</span>
                                )}
                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                                            ? 'bg-violet-600 text-white rounded-br-sm'
                                            : 'bg-secondary text-foreground rounded-bl-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                <span className="text-xs text-muted-foreground mx-1">
                                    {formatRelativeTime(msg.created_at)}
                                </span>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="pt-4 border-t border-border">
                <div className="flex gap-3">
                    <Input
                        id="chat-message-input"
                        placeholder="Escreva uma mensagem... (Enter para enviar)"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                        className="flex-1"
                    />
                    <Button
                        id="send-message-btn"
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        size="icon"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3" /> Chat privado — apenas membros aceitos
                </p>
            </div>
        </div>
    )
}
