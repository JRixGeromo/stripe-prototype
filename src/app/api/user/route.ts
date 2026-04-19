import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TEST_USER_EMAIL } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
    })

    // Return safe defaults if user doesn't exist yet
    if (!user) {
      return NextResponse.json({
        email: TEST_USER_EMAIL,
        plan: 'free',
        isProvisioned: false,
      })
    }

    return NextResponse.json({
      email: user.email,
      plan: user.plan,
      isProvisioned: user.isProvisioned,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
