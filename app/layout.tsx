import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'Foundr — Encontre seu Co-fundador',
    description: 'A plataforma onde builders se encontram, ideias ganham vida e startups nascem.',
    keywords: ['startup', 'co-founder', 'empreendedorismo', 'tecnologia'],
    openGraph: {
        title: 'Foundr — Encontre seu Co-fundador',
        description: 'A plataforma onde builders se encontram.',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" className="dark">
            <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
                {children}
            </body>
        </html>
    )
}
