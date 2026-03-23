import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { priceId, userId, email } = body

        if (!priceId || !userId) {
            return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
        }

        // Create or retrieve stripe customer
        let customerId: string | undefined
        const existingCustomers = await stripe.customers.list({ email, limit: 1 })
        if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customerId,
            customer_email: customerId ? undefined : email,
            line_items: [{ price: priceId, quantity: 1 }],
            payment_method_types: ['card'],
            metadata: { userId },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos?canceled=true`,
            locale: 'pt-BR',
            allow_promotion_codes: true,
        })

        return NextResponse.json({ url: session.url })
    } catch (error: unknown) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json(
            { error: 'Erro ao iniciar o pagamento. Tente novamente.' },
            { status: 500 }
        )
    }
}
