import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
    title: 'Termos de Uso e Política de Privacidade | Foundr',
    description: 'Termos de uso, política de privacidade e conformidade com a LGPD da plataforma Foundr.',
}

export default function TermosPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Link>

                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold gradient-text">Foundr</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-3">Termos de Uso e Política de Privacidade</h1>
                    <p className="text-muted-foreground">
                        Última atualização: 04 de março de 2026 — Versão 1.0
                    </p>
                </div>

                <div className="prose prose-invert max-w-none space-y-10">

                    {/* TERMOS DE USO */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-foreground">1. Termos de Uso</h2>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">1.1 Aceitação dos Termos</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Ao criar uma conta ou utilizar a plataforma Foundr, você concorda com estes Termos de Uso. Se não concordar com qualquer disposição, não utilize nossos serviços.
                        </p>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">1.2 Descrição do Serviço</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            O Foundr é uma plataforma de conexão entre empreendedores, cofundadores, investidores e talentos do ecossistema de startups brasileiro. Oferecemos ferramentas para publicação de projetos, matching por habilidades e comunicação em tempo real.
                        </p>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">1.3 Elegibilidade</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Para utilizar o Foundr, você deve ter ao menos 16 (dezesseis) anos de idade. Ao cadastrar-se, você declara possuir capacidade legal para celebrar contratos.
                        </p>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">1.4 Conduta do Usuário</h3>
                        <p className="text-muted-foreground leading-relaxed mb-2">É expressamente proibido:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4 pl-4">
                            <li>Publicar conteúdo falso, enganoso ou fraudulento;</li>
                            <li>Utilizar a plataforma para spam, phishing ou atividades ilegais;</li>
                            <li>Violar direitos de propriedade intelectual de terceiros;</li>
                            <li>Realizar engenharia reversa ou tentativas de invasão da plataforma;</li>
                            <li>Criar múltiplas contas para burlar restrições.</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">1.5 Planos e Pagamentos</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            O Foundr oferece planos de assinatura pagos (Básico e Premium) processados via Stripe. As cobranças são realizadas mensalmente. O cancelamento pode ser efetuado a qualquer momento, sem multa, sendo válido até o fim do período pago. Não há reembolso proporcional.
                        </p>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">1.6 Limitação de Responsabilidade</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            O Foundr é uma plataforma intermediária. Não nos responsabilizamos por negociações, acordos ou conflitos ocorridos entre usuários fora da plataforma. A plataforma é fornecida &quot;como está&quot;, sem garantia de disponibilidade ininterrupta.
                        </p>
                    </section>

                    <div className="h-px bg-border" />

                    {/* POLÍTICA DE PRIVACIDADE */}
                    <section id="privacidade">
                        <h2 className="text-2xl font-bold mb-4 text-foreground">2. Política de Privacidade e LGPD</h2>

                        <p className="text-muted-foreground leading-relaxed mb-6">
                            Esta Política de Privacidade descreve como o Foundr coleta, utiliza e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
                        </p>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">2.1 Dados Coletados</h3>
                        <p className="text-muted-foreground leading-relaxed mb-2">Coletamos os seguintes dados pessoais:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4 pl-4">
                            <li><strong>Dados de cadastro:</strong> nome completo, e-mail, idade e gênero;</li>
                            <li><strong>Dados de perfil:</strong> biografia profissional, habilidades e foto de perfil;</li>
                            <li><strong>Dados de uso:</strong> publicações, candidaturas e mensagens na plataforma;</li>
                            <li><strong>Dados de pagamento:</strong> processados diretamente pelo Stripe (não armazenamos dados de cartão);</li>
                            <li><strong>Dados de consentimento:</strong> registro de aceite dos termos com data e hora (timestamp).</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">2.2 Finalidade do Tratamento</h3>
                        <p className="text-muted-foreground leading-relaxed mb-2">Seus dados são utilizados para:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4 pl-4">
                            <li>Prestação dos serviços da plataforma (base legal: execução de contrato);</li>
                            <li>Comunicações transacionais por e-mail (confirmação, recuperação de senha);</li>
                            <li>Processamento de pagamentos de assinaturas;</li>
                            <li>Melhoria contínua da plataforma e análise de uso agregado;</li>
                            <li>Cumprimento de obrigações legais e regulatórias.</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">2.3 Compartilhamento com Terceiros</h3>
                        <p className="text-muted-foreground leading-relaxed mb-2">
                            O Foundr utiliza os seguintes serviços de terceiros, cada um com sua própria política de privacidade:
                        </p>
                        <div className="space-y-3 mb-4">
                            {[
                                {
                                    name: 'Supabase',
                                    role: 'Autenticação e banco de dados',
                                    url: 'https://supabase.com/privacy',
                                    detail: 'Armazena dados de perfil, autenticação e conteúdo da plataforma. Servidores localizados nos EUA com criptografia em repouso e em trânsito.',
                                },
                                {
                                    name: 'Stripe',
                                    role: 'Processamento de pagamentos',
                                    url: 'https://stripe.com/privacy',
                                    detail: 'Processa pagamentos de assinaturas. Somos PCI-DSS compliant via Stripe. Não armazenamos dados de cartão de crédito.',
                                },
                                {
                                    name: 'Resend',
                                    role: 'Envio de e-mails transacionais',
                                    url: 'https://resend.com/privacy',
                                    detail: 'Utilizado para envio de e-mails de confirmação de conta e recuperação de senha.',
                                },
                            ].map(service => (
                                <div key={service.name} className="p-4 rounded-xl bg-secondary/50 border border-border">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-foreground">{service.name}</span>
                                        <span className="text-xs text-muted-foreground">{service.role}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{service.detail}</p>
                                    <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300 underline">
                                        Ver Política de Privacidade →
                                    </a>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">2.4 Seus Direitos como Titular (LGPD)</h3>
                        <p className="text-muted-foreground leading-relaxed mb-2">Conforme a LGPD, você possui os seguintes direitos:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4 pl-4">
                            <li><strong>Acesso:</strong> solicitar cópia dos seus dados pessoais;</li>
                            <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados;</li>
                            <li><strong>Exclusão:</strong> solicitar a eliminação dos seus dados (direito ao esquecimento);</li>
                            <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado;</li>
                            <li><strong>Revogação do consentimento:</strong> a qualquer momento, sem efeito retroativo;</li>
                            <li><strong>Oposição:</strong> opor-se ao tratamento realizado com fundamento em legítimo interesse.</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Para exercer seus direitos, entre em contato pelo e-mail:{' '}
                            <a href="mailto:privacidade@foundr.com.br" className="text-violet-400 hover:text-violet-300 underline">
                                privacidade@foundr.com.br
                            </a>
                        </p>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">2.5 Retenção de Dados</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Seus dados são retidos enquanto sua conta estiver ativa. Após a exclusão da conta, os dados são eliminados em até 30 dias, exceto quando houver obrigação legal de retenção.
                        </p>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">2.6 Segurança</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, incluindo criptografia TLS em trânsito, criptografia em repouso no Supabase, e controles de acesso baseados em Row-Level Security (RLS).
                        </p>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">2.7 Contato do Encarregado (DPO)</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Em caso de dúvidas sobre esta política ou para exercer seus direitos, entre em contato com nosso encarregado de dados:{' '}
                            <a href="mailto:privacidade@foundr.com.br" className="text-violet-400 hover:text-violet-300 underline">
                                privacidade@foundr.com.br
                            </a>
                        </p>
                    </section>

                    <div className="h-px bg-border" />

                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Ao utilizar o Foundr, você confirma que leu e concorda com estes Termos de Uso e Política de Privacidade.
                        </p>
                        <p className="mt-2">
                            © 2026 Foundr. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
