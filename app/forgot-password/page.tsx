'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            setError('Informe seu endereço de e-mail.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            })
            if (error) throw error
            setSent(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao enviar e-mail. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md px-8"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/login" className="inline-flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-3xl font-bold gradient-text">Foundr</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Recuperar senha</h1>
                    <p className="text-muted-foreground text-sm">
                        Enviaremos um link de redefinição para o seu e-mail.
                    </p>
                </div>

                <div className="glass rounded-2xl p-8 glow">
                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-lg font-semibold">E-mail enviado</h2>
                            <p className="text-sm text-muted-foreground">
                                Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para redefinir sua senha.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Não recebeu? Verifique a pasta de spam ou{' '}
                                <button
                                    onClick={() => setSent(false)}
                                    className="text-violet-400 hover:text-violet-300 underline"
                                >
                                    tente novamente
                                </button>.
                            </p>
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="gap-2 mt-2">
                                    <ArrowLeft className="w-4 h-4" /> Voltar ao login
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="forgot-email" className="text-sm font-medium mb-2 block text-muted-foreground">
                                    Endereço de e-mail
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        placeholder="seuemail@exemplo.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="pl-10"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-400 flex items-center gap-2"
                                >
                                    <span className="shrink-0">⚠</span> {error}
                                </motion.p>
                            )}

                            <Button
                                id="send-reset-email-btn"
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                                ) : (
                                    'Enviar link de redefinição'
                                )}
                            </Button>

                            <div className="text-center">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                                        <ArrowLeft className="w-4 h-4" /> Voltar ao login
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
