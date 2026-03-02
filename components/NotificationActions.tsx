'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { CheckCircle, XCircle, Loader2, MessageCircle } from 'lucide-react'

interface NotificationActionsProps {
    applicationId: string
    applicantId: string
    ideaId: string
}

export default function NotificationActions({ applicationId, applicantId, ideaId }: NotificationActionsProps) {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
    const [done, setDone] = useState(false)
    const [result, setResult] = useState<'accepted' | 'rejected' | null>(null)

    const handleAction = async (action: 'accepted' | 'rejected') => {
        setLoading(action === 'accepted' ? 'accept' : 'reject')
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: action })
                .eq('id', applicationId)

            if (error) throw error

            setDone(true)
            setResult(action)
            toast({
                title: action === 'accepted' ? '✅ Candidatura aceita!' : '❌ Candidatura recusada',
                description: action === 'accepted'
                    ? 'O candidato agora tem acesso ao chat do grupo.'
                    : 'O candidato foi notificado.',
                variant: action === 'accepted' ? 'default' : 'destructive',
            })
            router.refresh()
        } catch (err) {
            console.error(err)
            toast({ title: 'Erro', description: 'Tente novamente.', variant: 'destructive' })
        } finally {
            setLoading(null)
        }
    }

    if (done) {
        return (
            <div className={`flex items-center gap-2 text-sm font-medium ${result === 'accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                {result === 'accepted' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {result === 'accepted' ? 'Aceito com sucesso' : 'Recusado'}
            </div>
        )
    }

    return (
        <>
            <Toaster />
            <div className="flex gap-3">
                <Button
                    id={`accept-${applicationId}`}
                    onClick={() => handleAction('accepted')}
                    disabled={!!loading}
                    size="sm"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-500"
                >
                    {loading === 'accept' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Aceitar
                </Button>
                <Button
                    id={`reject-${applicationId}`}
                    onClick={() => handleAction('rejected')}
                    disabled={!!loading}
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                >
                    {loading === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Recusar
                </Button>
            </div>
        </>
    )
}
