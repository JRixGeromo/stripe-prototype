import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { TEST_USER_EMAIL } from '@/lib/constants'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
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
        email: TEST_USER_EMAIL,
        plan: 'pro',
      },
      customer_email: TEST_USER_EMAIL,
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
