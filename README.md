# Stripe Subscription Prototype

A Next.js prototype simulating a paid trial / subscription onboarding flow with Stripe, Clerk authentication, Prisma, and Resend email.

## Main Flow

1. User signs in via Clerk
2. User clicks **Subscribe to Pro** → Stripe Checkout (subscription mode)
3. User completes payment → Stripe sends `checkout.session.completed` webhook
4. Webhook provisions the user in Prisma (source of truth) and mirrors state to Clerk metadata
5. Confirmation email sent via Resend
6. Thank-you page polls provisioning status → redirects to dashboard
7. Dashboard shows subscription status from Prisma

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Clerk** — authentication, route protection, user metadata
- **Stripe** — subscription checkout, webhook provisioning
- **Prisma v7** — ORM with SQLite (prototype), subscription persistence
- **Resend** — confirmation email delivery

## Required Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | From Stripe CLI (`whsec_...`) |
| `STRIPE_PRICE_ID` | Stripe Price ID for the subscription plan |
| `RESEND_API_KEY` | Resend API key (optional, for emails) |
| `RESEND_FROM_EMAIL` | Sender email (default: `onboarding@resend.dev`) |
| `DATABASE_URL` | SQLite connection string |

## How to Run Locally

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stripe Webhook Forwarding

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

This forwards Stripe events to your local server. The `STRIPE_WEBHOOK_SECRET` in `.env.local` must match the key shown by the CLI.

## Architecture

- **Prisma is the source of truth** for user/subscription state
- **Clerk publicMetadata** is a non-blocking convenience mirror
- **Webhook idempotency** uses a `WebhookEvent` table with `processing → processed → failed` status
- Failed provisioning marks the event as `failed`, allowing Stripe retries
- Email and Clerk metadata failures are non-blocking

## Known Limitations

- SQLite is for prototyping only — use PostgreSQL for production
- Resend free tier only sends to verified addresses (use `onboarding@resend.dev` as sender)
- No subscription lifecycle handling yet (cancellation, past_due, etc.)
- No Stripe Customer Portal for self-service management
