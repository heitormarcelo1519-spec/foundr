import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })

const PLAN_MAP: Record<string, string> = {
    [process.env.STRIPE_PRICE_ID_BASIC!]: 'basic',
    [process.env.STRIPE_PRICE_ID_PREMIUM!]: 'premium',
}

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: unknown) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Webhook inválido.' }, { status: 400 })
    }

    const supabase = await createClient()

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session
            const userId = session.metadata?.userId
            const customerId = session.customer as string

            if (userId && session.subscription) {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
                const priceId = subscription.items.data[0]?.price.id
                const planType = PLAN_MAP[priceId] ?? 'basic'
                const expiresAt = new Date(subscription.current_period_end * 1000).toISOString()

                await supabase.from('profiles').update({
                    stripe_customer_id: customerId,
                    plan_type: planType,
                    plan_expires_at: expiresAt,
                }).eq('id', userId)
            }
            break
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription
            const customerId = subscription.customer as string

            await supabase.from('profiles').update({
                plan_type: 'free',
                plan_expires_at: null,
            }).eq('stripe_customer_id', customerId)
            break
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription
            const customerId = subscription.customer as string
            const priceId = subscription.items.data[0]?.price.id
            const planType = PLAN_MAP[priceId] ?? 'basic'
            const expiresAt = new Date(subscription.current_period_end * 1000).toISOString()

            if (subscription.status === 'active') {
                await supabase.from('profiles').update({
                    plan_type: planType,
                    plan_expires_at: expiresAt,
                }).eq('stripe_customer_id', customerId)
            }
            break
        }
    }

    return NextResponse.json({ received: true })
}
