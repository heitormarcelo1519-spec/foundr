import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
    try {
        const { bio } = await request.json()

        if (!bio || bio.trim().length < 20) {
            return NextResponse.json(
                { error: 'A bio deve ter pelo menos 20 caracteres.' },
                { status: 400 }
            )
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                },
            ],
        })

        const prompt = `Você é um assistente de moderação e redação profissional para uma plataforma de startups chamada Foundr.

TAREFA:
1. Analise o texto abaixo para detectar conteúdo inadequado.
2. Se encontrar palavrões, discurso de ódio, preconceito, apologia ao crime (como nazismo, terrorismo), conteúdo sexual explícito ou qualquer conteúdo ofensivo, retorne APENAS este JSON:
{"moderated": true, "reason": "Descrição breve do problema encontrado"}

3. Se o texto for adequado, gere um resumo profissional em EXATAMENTE 3 linhas, adequado para um perfil de startup. O resumo deve ser direto, impactante e na primeira pessoa. Retorne APENAS este JSON:
{"moderated": false, "summary": "Linha 1 do resumo.\\nLinha 2 do resumo.\\nLinha 3 do resumo."}

TEXTO DO USUÁRIO:
"""
${bio.trim()}
"""

Responda APENAS com o JSON, sem markdown, sem texto adicional.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text().trim()

        let parsed: { moderated: boolean; reason?: string; summary?: string }
        try {
            // Clean up potential markdown code fences
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            parsed = JSON.parse(cleaned)
        } catch {
            return NextResponse.json(
                { error: 'Erro ao processar a bio. Por favor, tente novamente.' },
                { status: 500 }
            )
        }

        if (parsed.moderated) {
            return NextResponse.json(
                { error: `Conteúdo inadequado detectado: ${parsed.reason}. Por favor, reescreva sua bio de forma profissional.` },
                { status: 422 }
            )
        }

        return NextResponse.json({ summary: parsed.summary })
    } catch (error: unknown) {
        // Gemini blocked the content via safety settings
        if (error instanceof Error && error.message?.includes('SAFETY')) {
            return NextResponse.json(
                { error: 'Conteúdo bloqueado pela moderação. Por favor, reescreva sua bio de forma profissional e respeitosa.' },
                { status: 422 }
            )
        }

        console.error('process-bio error:', error)
        return NextResponse.json(
            { error: 'Erro interno. Por favor, tente novamente.' },
            { status: 500 }
        )
    }
}
