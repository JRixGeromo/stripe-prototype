import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getStripe } from '@/lib/stripe'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user email from Clerk
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const email = clerkUser.emailAddresses.find(
      e => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    if (!email) {
      return NextResponse.json(
        { error: 'User email is required for checkout' },
        { status: 400 }
      )
    }

    if (!env.stripe.priceId) {
      console.error('STRIPE_PRICE_ID is not configured')
      return NextResponse.json(
        { error: 'Subscription pricing is not configured' },
        { status: 500 }
      )
    }

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: env.stripe.priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.app.url}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.app.url}/`,
      metadata: {
        clerkId: userId,
        email,
        plan: 'pro',
        priceId: env.stripe.priceId,
      },
      customer_email: email,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error?.message || error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
