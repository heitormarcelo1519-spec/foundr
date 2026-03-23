'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Eye, EyeOff, KeyRound, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const supabase = createClient()
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [sessionReady, setSessionReady] = useState(false)

    useEffect(() => {
        // The callback route exchanges the code for a session before redirecting here.
        // We just verify the session exists.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSessionReady(true)
            } else {
                setError('Link de redefinição inválido ou expirado. Solicite um novo.')
            }
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
        if (!/[A-Z]/.test(pwd)) return 'A senha deve conter ao menos uma letra maiúscula.'
        if (!/[0-9]/.test(pwd)) return 'A senha deve conter ao menos um número.'
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const validationError = validatePassword(password)
        if (validationError) {
            setError(validationError)
            return
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setSuccess(true)
            setTimeout(() => router.push('/feed'), 3000)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao redefinir a senha. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md px-8"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-3xl font-bold gradient-text">Foundr</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Nova senha</h1>
                    <p className="text-muted-foreground text-sm">
                        Defina uma senha segura para a sua conta.
                    </p>
                </div>

                <div className="glass rounded-2xl p-8 glow">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-lg font-semibold">Senha redefinida com sucesso!</h2>
                            <p className="text-sm text-muted-foreground">
                                Você será redirecionado automaticamente em instantes...
                            </p>
                        </motion.div>
                    ) : !sessionReady && error ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                                <XCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-lg font-semibold">Link inválido ou expirado</h2>
                            <p className="text-sm text-muted-foreground">{error}</p>
                            <Link href="/forgot-password">
                                <Button size="sm" className="mt-2">
                                    Solicitar novo link
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="new-password" className="text-sm font-medium mb-2 block text-muted-foreground">
                                    Nova senha
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mínimo 8 caracteres"
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setError('') }}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Mínimo 8 caracteres, 1 maiúscula e 1 número.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="text-sm font-medium mb-2 block text-muted-foreground">
                                    Confirmar nova senha
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirm-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Repita a senha"
                                        value={confirmPassword}
                                        onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                                        className="pl-10"
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
                                id="reset-password-btn"
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={loading || !sessionReady}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Redefinindo...</>
                                ) : (
                                    'Redefinir senha'
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
