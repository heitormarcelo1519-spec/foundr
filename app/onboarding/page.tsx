'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { CheckCircle, ChevronRight, ChevronLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react'

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

const STEPS = [
    { title: 'Dados Básicos', description: 'Conte um pouco sobre você' },
    { title: 'Especialidades', description: 'O que você faz de melhor?' },
    { title: 'Sua Bio', description: 'IA vai resumir seu perfil' },
]

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 60 : -60,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction < 0 ? 60 : -60,
        opacity: 0,
    }),
}

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState('')
    const [aiSummary, setAiSummary] = useState('')

    // Form data
    const [fullName, setFullName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [categories, setCategories] = useState<string[]>([])
    const [bioRaw, setBioRaw] = useState('')

    const goToStep = (nextStep: number) => {
        setDirection(nextStep > step ? 1 : -1)
        setStep(nextStep)
    }

    const toggleCategory = (cat: string) => {
        setCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        )
    }

    const processbio = async () => {
        if (bioRaw.trim().length < 20) {
            setAiError('Por favor, escreva pelo menos 20 caracteres.')
            return
        }
        setAiLoading(true)
        setAiError('')
        setAiSummary('')
        try {
            const res = await fetch('/api/process-bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bio: bioRaw }),
            })
            const data = await res.json()
            if (!res.ok) {
                setAiError(data.error || 'Erro ao processar a bio.')
            } else {
                setAiSummary(data.summary)
            }
        } catch {
            setAiError('Erro de conexão. Tente novamente.')
        } finally {
            setAiLoading(false)
        }
    }

    const handleFinish = async () => {
        if (!aiSummary) {
            setAiError('Processe sua bio com IA antes de continuar.')
            return
        }
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    age: parseInt(age),
                    gender,
                    categories,
                    bio_raw: bioRaw,
                    bio_summary: aiSummary,
                    is_onboarded: true,
                })
                .eq('id', user.id)

            if (error) throw error

            router.push('/feed')
        } catch (err) {
            console.error(err)
            toast({ title: 'Erro', description: 'Não foi possível salvar seu perfil.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const canAdvanceStep1 = fullName.trim() && age && gender
    const canAdvanceStep2 = categories.length > 0

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <Toaster />
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-2xl font-bold gradient-text">Foundr</span>
                </div>

                {/* Stepper header */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${i < step ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                                        : i === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/30'
                                            : 'bg-secondary text-muted-foreground'
                                    }`}>
                                    {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                                </div>
                                <span className={`text-xs mt-1.5 font-medium hidden sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {s.title}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-3 transition-all duration-500 ${i < step ? 'bg-violet-500' : 'bg-border'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <div className="glass rounded-2xl p-8 glow overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        {/* STEP 1 */}
                        {step === 0 && (
                            <motion.div
                                key="step-0"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <h2 className="text-2xl font-bold mb-1">{STEPS[0].title}</h2>
                                <p className="text-muted-foreground mb-6">{STEPS[0].description}</p>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block text-muted-foreground">Nome completo</label>
                                        <Input
                                            id="full-name-input"
                                            placeholder="Ex: Maria Silva"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block text-muted-foreground">Idade</label>
                                            <Input
                                                id="age-input"
                                                type="number"
                                                placeholder="Ex: 28"
                                                min={16}
                                                max={99}
                                                value={age}
                                                onChange={e => setAge(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block text-muted-foreground">Gênero</label>
                                            <select
                                                id="gender-select"
                                                value={gender}
                                                onChange={e => setGender(e.target.value)}
                                                className="flex h-11 w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                                            >
                                                <option value="">Selecionar</option>
                                                <option value="male">Masculino</option>
                                                <option value="female">Feminino</option>
                                                <option value="non-binary">Não-binário</option>
                                                <option value="prefer_not_to_say">Prefiro não dizer</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-8">
                                    <Button
                                        id="step1-next-btn"
                                        onClick={() => canAdvanceStep1 && goToStep(1)}
                                        disabled={!canAdvanceStep1}
                                        size="lg"
                                        className="gap-2"
                                    >
                                        Próximo <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 */}
                        {step === 1 && (
                            <motion.div
                                key="step-1"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <h2 className="text-2xl font-bold mb-1">{STEPS[1].title}</h2>
                                <p className="text-muted-foreground mb-2">{STEPS[1].description}</p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Selecione todas que se aplicam a você ({categories.length} selecionadas)
                                </p>
                                <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1 pb-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                                            onClick={() => toggleCategory(cat)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${categories.includes(cat)
                                                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                                                    : 'border-border bg-secondary text-muted-foreground hover:border-violet-500/50 hover:text-foreground'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-8">
                                    <Button id="step2-back-btn" variant="ghost" onClick={() => goToStep(0)} className="gap-2">
                                        <ChevronLeft className="w-4 h-4" /> Voltar
                                    </Button>
                                    <Button
                                        id="step2-next-btn"
                                        onClick={() => canAdvanceStep2 && goToStep(2)}
                                        disabled={!canAdvanceStep2}
                                        size="lg"
                                        className="gap-2"
                                    >
                                        Próximo <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 */}
                        {step === 2 && (
                            <motion.div
                                key="step-2"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <h2 className="text-2xl font-bold mb-1">{STEPS[2].title}</h2>
                                <p className="text-muted-foreground mb-6">{STEPS[2].description}</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block text-muted-foreground">
                                            Escreva sua bio profissional
                                        </label>
                                        <Textarea
                                            id="bio-textarea"
                                            placeholder="Fale sobre sua experiência, projetos anteriores, motivações e o que você busca no Foundr..."
                                            value={bioRaw}
                                            onChange={e => { setBioRaw(e.target.value); setAiSummary(''); setAiError('') }}
                                            className="min-h-32"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">{bioRaw.length} caracteres</p>
                                    </div>

                                    <Button
                                        id="process-bio-btn"
                                        onClick={processbio}
                                        disabled={aiLoading || bioRaw.trim().length < 20}
                                        variant="outline"
                                        className="w-full gap-2 border-violet-500/30 hover:border-violet-500"
                                    >
                                        {aiLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Processando com IA...</>
                                        ) : (
                                            <><Sparkles className="w-4 h-4 text-violet-400" /> Gerar resumo com IA</>
                                        )}
                                    </Button>

                                    {aiError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                                        >
                                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                            {aiError}
                                        </motion.div>
                                    )}

                                    {aiSummary && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-violet-400" />
                                                <span className="text-sm font-semibold text-violet-300">Resumo gerado pela IA</span>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{aiSummary}</p>
                                            <p className="text-xs text-muted-foreground mt-2">Este será seu resumo público no Foundr.</p>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="flex justify-between mt-8">
                                    <Button id="step3-back-btn" variant="ghost" onClick={() => goToStep(1)} className="gap-2">
                                        <ChevronLeft className="w-4 h-4" /> Voltar
                                    </Button>
                                    <Button
                                        id="finish-onboarding-btn"
                                        onClick={handleFinish}
                                        disabled={!aiSummary || loading}
                                        size="lg"
                                        className="gap-2"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Entrar no Foundr
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Step indicator dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-1.5 bg-border'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
