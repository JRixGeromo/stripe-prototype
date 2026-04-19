import { prisma } from '@/lib/prisma'

export interface ProvisionUserData {
  email: string
  plan: 'free' | 'pro'
  stripeCustomerId?: string
  stripeSessionId?: string
}

export async function provisionUser(data: ProvisionUserData) {
  try {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        plan: data.plan,
        isProvisioned: true,
        stripeCustomerId: data.stripeCustomerId,
        stripeSessionId: data.stripeSessionId,
      },
      create: {
        email: data.email,
        plan: data.plan,
        isProvisioned: true,
        stripeCustomerId: data.stripeCustomerId,
        stripeSessionId: data.stripeSessionId,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error provisioning user:', error)
    return { success: false, error: 'Failed to provision user' }
  }
}
