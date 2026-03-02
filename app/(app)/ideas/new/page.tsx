'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { motion } from 'framer-motion'
import { Rocket, X, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
    'Full-stack Developer', 'Frontend', 'Backend', 'Mobile Developer',
    'UI Designer', 'UX Designer', 'Product Manager', 'Growth Hacker',
    'Copywriter', 'Especialista em SEO', 'Gestor de Tráfego', 'Data Scientist',
    'Engenheiro de ML', 'IA Specialist', 'Blockchain Developer', 'Advogado Tech',
    'Contador', 'Sales B2B', 'Customer Success', 'Engenheiro de Hardware',
    'Logística', 'Marketing de Influência', 'Videomaker', 'E-commerce Specialist',
    'CFO', 'COO', 'HR Specialist', 'CTO', 'CEO', 'Investidor Anjo',
    'Venture Capital', 'Cloud Architect', 'Cyber Security', 'DevSecOps',
    'DBA', 'QA Engineer', 'Tradutor', 'Game Dev', 'Biotech Specialist',
    'Agrotech Expert', 'Proptech Specialist', 'Healthtech Specialist',
    'Edtech Specialist', 'Sustainability Expert', 'Social Media', 'PR',
    'Brand Strategist', 'No-Code Developer', 'Process Analyst', 'Growth PM',
]

export default function NewIdeaPage() {
    const router = useRouter()
    const supabase = createClient()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [neededSkills, setNeededSkills] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [atLimit, setAtLimit] = useState(false)

    useEffect(() => {
        const checkLimit = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { count } = await supabase
                .from('ideas')
                .select('id', { count: 'exact', head: true })
                .eq('owner_id', user.id)
                .eq('is_active', true)

            setAtLimit((count ?? 0) >= 2)
            setChecking(false)
        }
        checkLimit()
    }, [])

    const toggleSkill = (skill: string) => {
        setNeededSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        )
    }

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim() || neededSkills.length === 0) {
            toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos e selecione ao menos uma habilidade.', variant: 'destructive' })
            return
        }

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('ideas')
                .insert({
                    owner_id: user.id,
                    title: title.trim(),
                    description: description.trim(),
                    needed_skills: neededSkills,
                })

            if (error) {
                if (error.message.includes('limite')) {
                    setAtLimit(true)
                    toast({ title: 'Limite atingido', description: 'Você já tem 2 ideias ativas.', variant: 'destructive' })
                } else {
                    throw error
                }
                return
            }

            toast({ title: '🚀 Projeto lançado!', description: 'Sua ideia está agora no feed.', variant: 'default' })
            setTimeout(() => router.push('/feed'), 1200)
        } catch (err) {
            console.error(err)
            toast({ title: 'Erro', description: 'Não foi possível criar a ideia.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    if (checking) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Toaster />
            <Link href="/feed" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-6">
                ← Voltar ao Feed
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8 glow"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Lançar Projeto</h1>
                        <p className="text-muted-foreground text-sm">Descreva sua ideia e atraia co-fundadores</p>
                    </div>
                </div>

                {atLimit ? (
                    <div className="flex flex-col items-center gap-4 py-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-amber-400" />
                        </div>
                        <h3 className="text-xl font-semibold">Limite de ideias atingido</h3>
                        <p className="text-muted-foreground">
                            Você já possui <strong>2 ideias ativas</strong>. Para lançar um novo projeto, desative uma de suas ideias existentes na página de perfil.
                        </p>
                        <Link href="/profile">
                            <Button variant="outline" className="mt-2">Ver meu perfil</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium mb-2 block text-muted-foreground">Título do projeto *</label>
                            <Input
                                id="idea-title-input"
                                placeholder="Ex: App de finanças colaborativas para MEIs"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block text-muted-foreground">Descrição detalhada *</label>
                            <Textarea
                                id="idea-description-input"
                                placeholder="Explique o problema que resolve, o mercado alvo, diferencial, estágio atual..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="min-h-36"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block text-muted-foreground">
                                Perfis que você busca * ({neededSkills.length} selecionados)
                            </label>
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        id={`skill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                                        onClick={() => toggleSkill(cat)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${neededSkills.includes(cat)
                                                ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                                                : 'border-border bg-secondary text-muted-foreground hover:border-violet-500/50 hover:text-foreground'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {neededSkills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                                    <span className="text-xs text-muted-foreground self-center">Selecionados:</span>
                                    {neededSkills.map(s => (
                                        <Badge key={s} variant="default" className="gap-1 cursor-pointer" onClick={() => toggleSkill(s)}>
                                            {s} <X className="w-3 h-3" />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            id="submit-idea-btn"
                            onClick={handleSubmit}
                            disabled={loading}
                            size="lg"
                            className="w-full gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                            Lançar Projeto
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
