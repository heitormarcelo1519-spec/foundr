'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, KeyRound, User, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FoundrLogo = () => (
    <div className="inline-flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
        <span className="text-4xl font-bold gradient-text">Foundr</span>
    </div>
)

const ErrorCard = ({ message }: { message: string }) => (
    <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
    >
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{message}</span>
    </motion.div>
)

function LoginTab() {
    const supabase = createClient()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Preencha todos os campos.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            router.push('/feed')
            router.refresh()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : ''
            if (msg.includes('Invalid login credentials')) {
                setError('E-mail ou senha incorretos. Verifique seus dados e tente novamente.')
            } else if (msg.includes('Email not confirmed')) {
                setError('Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.')
            } else {
                setError(msg || 'Erro ao fazer login. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
    }

    return (
        <div className="space-y-5">
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                    <label htmlFor="login-email" className="text-sm font-medium mb-2 block text-muted-foreground">
                        Endereço de e-mail
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError('') }}
                            className="pl-10"
                            autoComplete="email"
                            required
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="login-password" className="text-sm font-medium text-muted-foreground">
                            Senha
                        </label>
                        <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                            Esqueci minha senha
                        </Link>
                    </div>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Sua senha"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError('') }}
                            className="pl-10 pr-10"
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {error && <ErrorCard message={error} />}

                <Button
                    id="email-login-btn"
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</> : 'Entrar'}
                </Button>
            </form>

            <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">ou</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <Button
                id="google-login-btn"
                onClick={handleGoogleLogin}
                size="lg"
                variant="outline"
                className="w-full gap-3 font-semibold"
            >
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar com Google
            </Button>
        </div>
    )
}

function RegisterTab() {
    const supabase = createClient()
    const router = useRouter()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [lgpdConsent, setLgpdConsent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [emailSent, setEmailSent] = useState(false)

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
        if (!/[A-Z]/.test(pwd)) return 'A senha deve conter ao menos uma letra maiúscula.'
        if (!/[0-9]/.test(pwd)) return 'A senha deve conter ao menos um número.'
        return ''
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!lgpdConsent) {
            setError('É necessário concordar com os Termos de Uso e Política de Privacidade para criar sua conta.')
            return
        }
        const pwdError = validatePassword(password)
        if (pwdError) { setError(pwdError); return }
        if (password !== confirmPassword) { setError('As senhas não coincidem.'); return }

        setLoading(true)
        setError('')
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error

            // Record LGPD consent
            if (data.user) {
                await supabase.from('consent_records').insert({
                    user_id: data.user.id,
                    terms_version: '1.0',
                })
            }

            if (data.session) {
                // Auto-confirmed (e.g., email confirmation disabled in dev)
                router.push('/onboarding')
            } else {
                setEmailSent(true)
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : ''
            if (msg.includes('User already registered')) {
                setError('Já existe uma conta com este e-mail. Tente fazer login.')
            } else {
                setError(msg || 'Erro ao criar conta. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    if (emailSent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-4"
            >
                <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold">Confirme seu e-mail</h2>
                <p className="text-sm text-muted-foreground">
                    Enviamos um link de confirmação para <strong>{email}</strong>.<br />
                    Clique no link para ativar sua conta e completar o cadastro.
                </p>
                <p className="text-xs text-muted-foreground">
                    Não recebeu? Verifique a pasta de spam.
                </p>
            </motion.div>
        )
    }

    return (
        <form onSubmit={handleRegister} className="space-y-4">
            <div>
                <label htmlFor="register-name" className="text-sm font-medium mb-2 block text-muted-foreground">
                    Nome completo
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="register-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={e => { setFullName(e.target.value); setError('') }}
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="register-email" className="text-sm font-medium mb-2 block text-muted-foreground">
                    Endereço de e-mail
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="register-email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError('') }}
                        className="pl-10"
                        autoComplete="email"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="register-password" className="text-sm font-medium mb-2 block text-muted-foreground">
                    Senha
                </label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="register-password"
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
                        aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Mínimo 8 caracteres, 1 maiúscula e 1 número.</p>
            </div>

            <div>
                <label htmlFor="register-confirm-password" className="text-sm font-medium mb-2 block text-muted-foreground">
                    Confirmar senha
                </label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="register-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repita sua senha"
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            {/* LGPD Consent */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                <input
                    id="lgpd-consent"
                    type="checkbox"
                    checked={lgpdConsent}
                    onChange={e => { setLgpdConsent(e.target.checked); setError('') }}
                    className="mt-0.5 h-4 w-4 rounded border-border text-violet-500 focus:ring-violet-500 cursor-pointer shrink-0"
                    required
                />
                <label htmlFor="lgpd-consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    Li e concordo com os{' '}
                    <Link href="/termos" target="_blank" className="text-violet-400 hover:text-violet-300 underline">
                        Termos de Uso e Política de Privacidade
                    </Link>
                    {' '}do Foundr, incluindo o uso de dados pessoais conforme a LGPD (Lei 13.709/2018).
                </label>
            </div>

            {error && <ErrorCard message={error} />}

            <Button
                id="register-btn"
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || !lgpdConsent}
            >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando conta...</> : 'Criar conta gratuita'}
            </Button>
        </form>
    )
}

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

    const benefits = [
        { icon: '🚀', text: 'Publique sua startup e recrute talentos' },
        { icon: '🤝', text: 'Matching inteligente por habilidades' },
        { icon: '💬', text: 'Chat em tempo real com seu time' },
    ]

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
            {/* Animated gradient background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md px-8"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <FoundrLogo />
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-sm leading-relaxed"
                    >
                        A plataforma onde builders se encontram, ideias ganham vida e startups nascem.
                    </motion.p>
                </div>

                {/* Auth card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-8 glow"
                >
                    {/* Benefits */}
                    <div className="space-y-2 mb-6">
                        {benefits.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3 text-sm text-muted-foreground"
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="h-px bg-border mb-6" />

                    {/* Tab switcher */}
                    <div className="flex rounded-xl bg-secondary/50 p-1 mb-6">
                        <button
                            id="tab-login"
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'login'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Entrar
                        </button>
                        <button
                            id="tab-register"
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'register'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Criar conta
                        </button>
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'login' ? <LoginTab /> : <RegisterTab />}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
                    Ao utilizar a plataforma, você concorda com nossos{' '}
                    <Link href="/termos" className="underline hover:text-foreground transition-colors">
                        Termos de Uso
                    </Link>
                    {' '}e{' '}
                    <Link href="/termos#privacidade" className="underline hover:text-foreground transition-colors">
                        Política de Privacidade
                    </Link>.
                </p>
            </motion.div>
        </div>
    )
}
