'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, CheckCircle, Clock, XCircle } from 'lucide-react'

interface ApplyModalProps {
    ideaId: string
    userId: string
    existingApplication: { status: 'pending' | 'accepted' | 'rejected' } | null
}

export default function ApplyModal({ ideaId, userId, existingApplication }: ApplyModalProps) {
    const supabase = createClient()
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [applied, setApplied] = useState(!!existingApplication)
    const [status, setStatus] = useState(existingApplication?.status)

    const statusConfig = {
        pending: { label: 'Candidatura enviada', icon: Clock, variant: 'warning' as const, color: 'text-amber-400' },
        accepted: { label: 'Candidatura aceita! 🎉', icon: CheckCircle, variant: 'success' as const, color: 'text-emerald-400' },
        rejected: { label: 'Candidatura não aprovada', icon: XCircle, variant: 'destructive' as const, color: 'text-red-400' },
    }

    const handleApply = async () => {
        if (!message.trim() || message.trim().length < 30) {
            toast({ title: 'Mensagem muito curta', description: 'Escreva pelo menos 30 caracteres justificando seu interesse.', variant: 'destructive' })
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from('applications')
                .insert({
                    idea_id: ideaId,
                    applicant_id: userId,
                    message: message.trim(),
                })

            if (error) {
                if (error.code === '23505') {
                    toast({ title: 'Já candidatado', description: 'Você já se candidatou a esta ideia.', variant: 'destructive' })
                } else {
                    throw error
                }
                return
            }

            setApplied(true)
            setStatus('pending')
            setOpen(false)
            toast({ title: '✅ Candidatura enviada!', description: 'O criador da ideia irá analisar sua candidatura.', variant: 'default' })
        } catch (err) {
            console.error(err)
            toast({ title: 'Erro', description: 'Não foi possível enviar a candidatura.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    if (applied && status) {
        const cfg = statusConfig[status]
        return (
            <div className="glass rounded-2xl p-6 flex items-center gap-4">
                <Toaster />
                <div className={`p-3 rounded-xl bg-secondary`}>
                    <cfg.icon className={`w-6 h-6 ${cfg.color}`} />
                </div>
                <div>
                    <p className={`font-semibold ${cfg.color}`}>{cfg.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {status === 'pending' && 'Aguardando análise do criador do projeto.'}
                        {status === 'accepted' && 'Você agora é membro desta ideia. Acesse o chat!'}
                        {status === 'rejected' && 'Que pena! Continue explorando outras ideias no feed.'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Toaster />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button id="apply-btn" size="lg" className="w-full gap-2">
                        <Send className="w-4 h-4" />
                        Quero participar deste projeto
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Candidatar-se ao projeto</DialogTitle>
                        <DialogDescription>
                            Explique por que você é o perfil ideal para este projeto. Seja específico sobre suas experiências e habilidades.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <Textarea
                            id="apply-message-textarea"
                            placeholder="Ex: Tenho 5 anos de experiência em desenvolvimento mobile com React Native, já trabalhei em 3 startups de fintech e tenho paixão por resolver problemas de gestão financeira para pequenos negócios..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="min-h-36"
                        />
                        <p className="text-xs text-muted-foreground">{message.length} caracteres (mínimo 30)</p>
                        <Button
                            id="submit-apply-btn"
                            onClick={handleApply}
                            disabled={loading || message.trim().length < 30}
                            className="w-full gap-2"
                            size="lg"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Enviar candidatura
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
