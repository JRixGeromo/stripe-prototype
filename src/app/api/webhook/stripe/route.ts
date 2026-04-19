import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { provisionUser } from '@/services/provision-user'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  try {
    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.stripe.webhookSecret
    )

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      // Check idempotency using WebhookEvent
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { eventId: event.id }
      })

      if (existingEvent) {
        return NextResponse.json({ received: true })
      }

      // Mark event as processed
      await prisma.webhookEvent.create({
        data: {
          eventId: event.id,
          type: event.type,
        }
      })

      // Extract metadata from session
      const email = session.metadata?.email
      const plan = session.metadata?.plan
      const stripeCustomerId = session.customer as string
      const stripeSessionId = session.id

      if (!email || !plan) {
        console.error('Missing metadata in checkout session:', session.id)
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        )
      }

      // Call provisioning service
      const result = await provisionUser({
        email,
        plan: plan as 'free' | 'pro',
        stripeCustomerId,
        stripeSessionId,
      })

      if (!result.success) {
        console.error('Provisioning failed:', result.error)
        return NextResponse.json(
          { error: 'Provisioning failed' },
          { status: 500 }
        )
      }

      console.log('User provisioned successfully:', email)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    
    if (error instanceof Error && error.message.includes('signature')) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
