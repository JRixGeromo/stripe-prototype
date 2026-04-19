// Environment variable validation
const requiredEnvVars = [
  'DATABASE_URL',
] as const

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file and copy from .env.local.example`
    )
  }
}

// Export typed environment variables for better developer experience
export const env = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'Stripe Prototype <onboarding@resend.dev>',
  },
} as const
