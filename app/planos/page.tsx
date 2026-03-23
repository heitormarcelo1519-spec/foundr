'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Zap, Crown, ArrowRight, Loader2, Shield, Star, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

const plans = [
    {
        id: 'basic',
        name: 'Básico',
        price: 14.99,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC,
        description: 'Para quem quer se destacar na plataforma',
        badge: '🛡️ Verificado',
        color: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-500/30',
        accentColor: 'text-blue-400',
        features: [
            { icon: Shield, text: 'Badge de perfil verificado' },
            { icon: Star, text: 'Prioridade nas listagens de busca' },
            { icon: Users, text: 'Acesso completo ao feed de startups' },
            { icon: CheckCircle, text: 'Suporte prioritário via e-mail' },
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 59.99,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM,
        description: 'Para founders sérios que querem o máximo',
        badge: '👑 Premium',
        popular: true,
        color: 'from-violet-500/20 to-pink-500/20',
        borderColor: 'border-violet-500/50',
        accentColor: 'text-violet-400',
        features: [
            { icon: Crown, text: 'Destaque máximo nas listagens' },
            { icon: Users, text: 'Sistema de recepção de leads qualificados' },
            { icon: Sparkles, text: 'Ferramentas de IA para marketing (Averi)' },
            { icon: Zap, text: 'Badge Premium exclusivo no perfil' },
            { icon: Shield, text: 'Perfil verificado e destacado' },
            { icon: Star, text: 'Acesso antecipado a novos recursos' },
        ],
    },
]

export default function PlanosPage() {
    const { user, profile } = useAuth()
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Check URL params for redirect status
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        if (params.get('success') === 'true' && !message) {
            setMessage({ type: 'success', text: 'Pagamento realizado com sucesso! Seu plano já está ativo.' })
        }
        if (params.get('canceled') === 'true' && !message) {
            setMessage({ type: 'error', text: 'O pagamento foi cancelado. Escolha um plano para assinar.' })
        }
    }

    const handleSubscribe = async (plan: typeof plans[0]) => {
        if (!user) {
            window.location.href = '/login'
            return
        }
        setLoadingPlan(plan.id)
        setMessage(null)
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: plan.priceId,
                    userId: user.id,
                    email: user.email,
                }),
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                setMessage({ type: 'error', text: data.error || 'Erro ao iniciar o pagamento.' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' })
        } finally {
            setLoadingPlan(null)
        }
    }

    return (
        <div className="min-h-screen bg-background py-16 px-4">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        Planos e Assinaturas
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Potencialize sua <span className="gradient-text">presença</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Escolha o plano ideal para conectar-se com os melhores talentos e impulsionar sua startup.
                    </p>
                    {profile?.plan_type && profile.plan_type !== 'free' && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Plano atual: <strong className="capitalize">{profile.plan_type}</strong>
                        </div>
                    )}
                </motion.div>

                {/* Status message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-8 p-4 rounded-xl border text-sm text-center ${message.type === 'success'
                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                {/* Plans grid */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative rounded-2xl border p-8 bg-gradient-to-br ${plan.color} ${plan.borderColor} flex flex-col ${plan.popular ? 'ring-2 ring-violet-500/50' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold">
                                        Mais popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className={`text-sm font-medium mb-2 ${plan.accentColor}`}>{plan.badge}</div>
                                <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
                                <p className="text-muted-foreground text-sm">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">
                                        R$ {plan.price.toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-muted-foreground text-sm">/mês</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm">
                                        <feature.icon className={`w-4 h-4 mt-0.5 shrink-0 ${plan.accentColor}`} />
                                        <span className="text-muted-foreground">{feature.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                id={`subscribe-${plan.id}-btn`}
                                size="lg"
                                onClick={() => handleSubscribe(plan)}
                                disabled={loadingPlan === plan.id || profile?.plan_type === plan.id}
                                className={`w-full gap-2 ${plan.popular ? '' : 'variant-outline'}`}
                                variant={plan.popular ? 'default' : 'outline'}
                            >
                                {loadingPlan === plan.id ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
                                ) : profile?.plan_type === plan.id ? (
                                    <><CheckCircle className="w-4 h-4" /> Plano atual</>
                                ) : (
                                    <>Assinar {plan.name} <ArrowRight className="w-4 h-4" /></>
                                )}
                            </Button>

                            {!user && (
                                <p className="text-xs text-center text-muted-foreground mt-3">
                                    <Link href="/login" className="text-violet-400 hover:text-violet-300 underline">
                                        Faça login
                                    </Link>
                                    {' '}para assinar
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Free plan note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <p className="text-muted-foreground text-sm">
                        Todos os planos incluem cancelamento a qualquer momento, sem multas.
                        <br />
                        Pagamentos processados com segurança via Stripe, com suporte a Pix e cartão de crédito.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Pagamento seguro</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Cancele quando quiser</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Ativação imediata</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
