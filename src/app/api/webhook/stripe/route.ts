import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { provisionUser } from '@/services/provision-user'
import { sendConfirmationEmail } from '@/services/send-confirmation-email'
import { env } from '@/lib/env'
import { clerkClient } from '@clerk/nextjs/server'

// SOURCE OF TRUTH: Prisma (database) is the authoritative record for user state.
// Clerk publicMetadata is a read-optimized mirror for fast client-side access.
// If Clerk metadata update fails, Prisma remains correct — the webhook does NOT fail.
// The app should always read from Prisma (via API routes) for authoritative state.

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

      // Check idempotency — skip if already processed
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { eventId: event.id }
      })

      if (existingEvent?.status === 'processed') {
        return NextResponse.json({ received: true })
      }

      // Record event as processing (prevents concurrent duplicate processing)
      const webhookEvent = await prisma.webhookEvent.upsert({
        where: { eventId: event.id },
        create: {
          eventId: event.id,
          type: event.type,
          status: 'processing',
        },
        update: {
          status: 'processing',
        },
      })

      // Extract metadata from session
      const clerkId = session.metadata?.clerkId
      const email = session.metadata?.email
      const plan = session.metadata?.plan
      const stripeCustomerId = session.customer as string
      const stripeSubscriptionId = (session.subscription as string | null) ?? undefined
      const priceId = session.metadata?.priceId || undefined

      console.log('Webhook metadata:', { clerkId, email, plan, stripeCustomerId, stripeSubscriptionId, priceId })

      if (!clerkId || !email || !plan) {
        console.error('Missing metadata in checkout session:', session.id, 'metadata:', session.metadata)
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { status: 'failed' },
        })
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        )
      }

      // Call provisioning service (Prisma sync)
      const result = await provisionUser({
        clerkId,
        email,
        plan: plan as 'free' | 'pro',
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: 'active',
        priceId,
      })

      if (!result.success) {
        console.error('Provisioning failed:', result.error)
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { status: 'failed' },
        })
        return NextResponse.json(
          { error: 'Provisioning failed' },
          { status: 500 }
        )
      }

      // ── Clerk metadata sync (non-blocking mirror) ──
      // Prisma is the source of truth. This Clerk update is a convenience mirror
      // for fast client-side reads. Failure here does NOT affect provisioning.
      try {
        const client = await clerkClient()
        await client.users.updateUserMetadata(clerkId, {
          publicMetadata: {
            plan: plan,
          },
        })
        console.log('Clerk metadata synced for clerkId:', clerkId)
      } catch (clerkError) {
        // Partial failure: Prisma provisioning succeeded, but Clerk mirror is stale.
        // The next Prisma read will return the correct state regardless.
        console.error('Clerk metadata sync failed (Prisma is still authoritative) for clerkId:', clerkId, clerkError)
      }

      console.log('Provisioning complete (Prisma authoritative):', { email, plan, stripeSubscriptionId })

      // Send confirmation email (non-blocking — don't fail webhook if email fails)
      try {
        await sendConfirmationEmail({ email, plan })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }

      // Mark event as processed only after all critical steps succeed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'processed' },
      })
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
