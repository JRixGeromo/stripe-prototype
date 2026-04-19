import { prisma } from '@/lib/prisma'

export interface ProvisionUserData {
  clerkId: string
  email: string
  plan: 'free' | 'pro'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus?: 'inactive' | 'active' | 'past_due' | 'canceled' | 'unpaid'
  priceId?: string
}

export async function provisionUser(data: ProvisionUserData) {
  try {
    const user = await prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: {
        email: data.email,
        plan: data.plan,
        isProvisioned: true,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        subscriptionStatus: data.subscriptionStatus || 'active',
        priceId: data.priceId,
      },
      create: {
        clerkId: data.clerkId,
        email: data.email,
        plan: data.plan,
        isProvisioned: true,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        subscriptionStatus: data.subscriptionStatus || 'active',
        priceId: data.priceId,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error provisioning user:', error)
    return { success: false, error: 'Failed to provision user' }
  }
}
