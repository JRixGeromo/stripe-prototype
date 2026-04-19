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
