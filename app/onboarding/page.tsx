'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import {
    CheckCircle, ChevronRight, ChevronLeft, Loader2,
    Users, TrendingUp, Network, BookOpen, Lightbulb, Handshake, Target, MoreHorizontal
} from 'lucide-react'

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

const INTENTIONS = [
    { id: 'cofoundador', label: 'Encontrar cofundador', icon: Handshake },
    { id: 'investimento', label: 'Captar investimento', icon: TrendingUp },
    { id: 'equipe', label: 'Montar equipe técnica', icon: Users },
    { id: 'networking', label: 'Fazer networking', icon: Network },
    { id: 'mentoria', label: 'Encontrar mentor', icon: BookOpen },
    { id: 'cliente', label: 'Testar com clientes', icon: Target },
    { id: 'parceiro', label: 'Buscar parceiros estratégicos', icon: Lightbulb },
    { id: 'outro', label: 'Outro objetivo', icon: MoreHorizontal },
]

const STEPS = [
    { title: 'Sua Intenção', description: 'O que você busca no Foundr?' },
    { title: 'Dados Básicos', description: 'Conte um pouco sobre você' },
    { title: 'Especialidades', description: 'O que você faz de melhor?' },
    { title: 'Sua Bio', description: 'Apresente-se para a comunidade' },
]

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 60 : -60, opacity: 0 }),
}

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const [loading, setLoading] = useState(false)

    const [selectedIntentions, setSelectedIntentions] = useState<string[]>([])
    const [fullName, setFullName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [categories, setCategories] = useState<string[]>([])
    const [bio, setBio] = useState('')

    const goToStep = (nextStep: number) => {
        setDirection(nextStep > step ? 1 : -1)
        setStep(nextStep)
    }

    const toggleIntention = (id: string) => {
        setSelectedIntentions(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleCategory = (cat: string) => {
        setCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        )
    }

    const handleFinish = async () => {
        if (bio.trim().length < 20) {
            toast({ title: 'Bio muito curta', description: 'Escreva pelo menos 20 caracteres.', variant: 'destructive' })
            return
        }
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Sessão expirada.')

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    age: parseInt(age),
                    gender,
                    categories,
                    bio_raw: bio,
                    bio_summary: bio,
                    is_onboarded: true,
                })
                .eq('id', user.id)

            if (error) throw error
            router.push('/feed')
        } catch (err) {
            console.error(err)
            toast({ title: 'Erro', description: 'Não foi possível salvar. Tente novamente.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const canAdvanceStep0 = selectedIntentions.length > 0
    const canAdvanceStep1 = fullName.trim() && age && gender
    const canAdvanceStep2 = categories.length > 0
    const canFinish = bio.trim().length >= 20

    const progressPercent = (step / (STEPS.length - 1)) * 100

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] p-4">
            <Toaster />
            {/* Background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-700/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                            <path d="M12 2C12 2 8 6 8 12H16C16 6 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 12L6 17H18L16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 17V20M14 17V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="12" cy="9" r="1.5" fill="currentColor" />
                        </svg>
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-white">Foundr</span>
                </div>

                {/* Progress */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40">Etapa {step + 1} de {STEPS.length}</span>
                        <span className="text-xs text-white/40">{Math.round(progressPercent)}% concluído</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                    </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border ${i < step
                                        ? 'bg-violet-600 border-violet-600 text-white'
                                        : i === step
                                            ? 'bg-white/10 border-white/30 text-white ring-4 ring-white/5'
                                            : 'bg-transparent border-white/10 text-white/30'
                                    }`}>
                                    {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={`text-xs mt-1.5 font-medium hidden sm:block ${i === step ? 'text-white/70' : 'text-white/25'}`}>
                                    {s.title}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px mx-2 transition-all duration-500 ${i < step ? 'bg-violet-600' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>

                        {/* STEP 0 — Intenção */}
                        {step === 0 && (
                            <motion.div key="step-0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                <h2 className="text-2xl font-bold text-white mb-1">{STEPS[0].title}</h2>
                                <p className="text-white/40 text-sm mb-6">{STEPS[0].description} <span className="text-white/25">({selectedIntentions.length} selecionado{selectedIntentions.length !== 1 ? 's' : ''})</span></p>
                                <div className="grid grid-cols-2 gap-3">
                                    {INTENTIONS.map(intent => (
                                        <button
                                            key={intent.id}
                                            id={`intention-${intent.id}`}
                                            onClick={() => toggleIntention(intent.id)}
                                            className={`flex items-center gap-3 p-4 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${selectedIntentions.includes(intent.id)
                                                    ? 'border-violet-500/60 bg-violet-500/10 text-white'
                                                    : 'border-white/[0.07] bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80'
                                                }`}
                                        >
                                            <intent.icon className={`w-4 h-4 shrink-0 ${selectedIntentions.includes(intent.id) ? 'text-violet-400' : 'text-white/30'}`} />
                                            <span>{intent.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-8">
                                    <Button id="step0-next" onClick={() => canAdvanceStep0 && goToStep(1)} disabled={!canAdvanceStep0} className="gap-2 bg-violet-600 hover:bg-violet-700">
                                        Próximo <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 1 — Dados Básicos */}
                        {step === 1 && (
                            <motion.div key="step-1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                <h2 className="text-2xl font-bold text-white mb-1">{STEPS[1].title}</h2>
                                <p className="text-white/40 text-sm mb-6">{STEPS[1].description}</p>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2 block">Nome completo</label>
                                        <Input id="full-name-input" placeholder="Ex: Maria Silva" value={fullName} onChange={e => setFullName(e.target.value)}
                                            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-500/50" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2 block">Idade</label>
                                            <Input id="age-input" type="number" placeholder="28" min={16} max={99} value={age} onChange={e => setAge(e.target.value)}
                                                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-500/50" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2 block">Gênero</label>
                                            <select id="gender-select" value={gender} onChange={e => setGender(e.target.value)}
                                                className="flex h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors">
                                                <option value="" className="bg-[#0a0a0f]">Selecionar</option>
                                                <option value="male" className="bg-[#0a0a0f]">Masculino</option>
                                                <option value="female" className="bg-[#0a0a0f]">Feminino</option>
                                                <option value="non-binary" className="bg-[#0a0a0f]">Não-binário</option>
                                                <option value="prefer_not_to_say" className="bg-[#0a0a0f]">Prefiro não informar</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-8">
                                    <Button id="step1-back" variant="ghost" onClick={() => goToStep(0)} className="gap-2 text-white/50 hover:text-white">
                                        <ChevronLeft className="w-4 h-4" /> Voltar
                                    </Button>
                                    <Button id="step1-next" onClick={() => canAdvanceStep1 && goToStep(2)} disabled={!canAdvanceStep1} className="gap-2 bg-violet-600 hover:bg-violet-700">
                                        Próximo <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 — Especialidades */}
                        {step === 2 && (
                            <motion.div key="step-2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                <h2 className="text-2xl font-bold text-white mb-1">{STEPS[2].title}</h2>
                                <p className="text-white/40 text-sm mb-2">{STEPS[2].description}</p>
                                <p className="text-xs text-white/25 mb-5">{categories.length} selecionada{categories.length !== 1 ? 's' : ''}</p>
                                <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1 pb-2">
                                    {CATEGORIES.map(cat => (
                                        <button key={cat} id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => toggleCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${categories.includes(cat)
                                                    ? 'border-violet-500/60 bg-violet-500/10 text-violet-300'
                                                    : 'border-white/[0.07] bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/70'
                                                }`}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-8">
                                    <Button id="step2-back" variant="ghost" onClick={() => goToStep(1)} className="gap-2 text-white/50 hover:text-white">
                                        <ChevronLeft className="w-4 h-4" /> Voltar
                                    </Button>
                                    <Button id="step2-next" onClick={() => canAdvanceStep2 && goToStep(3)} disabled={!canAdvanceStep2} className="gap-2 bg-violet-600 hover:bg-violet-700">
                                        Próximo <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 — Bio */}
                        {step === 3 && (
                            <motion.div key="step-3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                                <h2 className="text-2xl font-bold text-white mb-1">{STEPS[3].title}</h2>
                                <p className="text-white/40 text-sm mb-6">{STEPS[3].description}</p>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2 block">Bio profissional</label>
                                    <Textarea
                                        id="bio-textarea"
                                        placeholder="Fale sobre sua experiência, projetos anteriores, motivações e o que você busca no Foundr..."
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        className="min-h-40 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-violet-500/50 resize-none"
                                    />
                                    <p className={`text-xs mt-1.5 ${bio.length >= 20 ? 'text-white/30' : 'text-white/20'}`}>
                                        {bio.length} caracteres {bio.length < 20 && `— mínimo ${20 - bio.length} restantes`}
                                    </p>
                                </div>
                                <div className="flex justify-between mt-8">
                                    <Button id="step3-back" variant="ghost" onClick={() => goToStep(2)} className="gap-2 text-white/50 hover:text-white">
                                        <ChevronLeft className="w-4 h-4" /> Voltar
                                    </Button>
                                    <Button
                                        id="finish-onboarding-btn"
                                        onClick={handleFinish}
                                        disabled={!canFinish || loading}
                                        className="gap-2 bg-violet-600 hover:bg-violet-700"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                                        ) : (
                                            <><CheckCircle className="w-4 h-4" /> Entrar no Foundr</>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
