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

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pro Plan',
              description: 'Access to all premium features',
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      success_url: `${env.app.url}/thank-you`,
      cancel_url: `${env.app.url}/`,
      metadata: {
        clerkId: userId,
        email: email || '',
        plan: 'pro',
      },
      customer_email: email || undefined,
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
