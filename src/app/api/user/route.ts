import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    // Return safe defaults if user doesn't exist yet
    if (!user) {
      return NextResponse.json({
        plan: 'free',
        isProvisioned: false,
        subscriptionStatus: 'inactive',
      })
    }

    return NextResponse.json({
      email: user.email,
      plan: user.plan,
      isProvisioned: user.isProvisioned,
      subscriptionStatus: user.subscriptionStatus,
      priceId: user.priceId,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
