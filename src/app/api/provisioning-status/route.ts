import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TEST_USER_EMAIL } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
    })

    if (!user) {
      return NextResponse.json({
        isProvisioned: false,
        plan: 'free',
      })
    }

    return NextResponse.json({
      isProvisioned: user.isProvisioned,
      plan: user.plan,
    })
  } catch (error) {
    console.error('Error checking provisioning status:', error)
    return NextResponse.json(
      { error: 'Failed to check provisioning status' },
      { status: 500 }
    )
  }
}
