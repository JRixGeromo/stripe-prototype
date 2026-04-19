import { Resend } from 'resend'
import { env } from '@/lib/env'

export interface ConfirmationEmailData {
  email: string
  plan: string
}

export async function sendConfirmationEmail(data: ConfirmationEmailData) {
  if (!env.resend.apiKey) {
    console.warn('RESEND_API_KEY not set — skipping confirmation email')
    return { success: false, reason: 'missing_api_key' }
  }

  const resend = new Resend(env.resend.apiKey)

  try {
    const result = await resend.emails.send({
      from: env.resend.fromEmail,
      to: data.email,
      subject: 'Your Pro Plan is Ready!',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color: #111827;">Welcome to Pro! 🎉</h1>
          <p style="color: #374151; font-size: 16px;">
            Your <strong>${data.plan}</strong> plan is now active.
          </p>
          <p style="color: #374151; font-size: 16px;">
            You now have access to all premium features including Advanced Analytics, Priority Support, Unlimited Projects, and Custom Integrations.
          </p>
          <a href="${env.app.url}/dashboard"
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 8px;">
            Go to Dashboard
          </a>
        </div>
      `,
    })

    console.log('Confirmation email sent:', result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
