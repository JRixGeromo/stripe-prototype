# Stripe Subscription Prototype Architecture

## Overview
A Next.js 16 application with Prisma v7 and Stripe integration for subscription-based access control.

## Architecture Flow

```mermaid
graph TB
    subgraph "Frontend (Next.js App Router)"
        A[Landing Page] -->|Click Subscribe| B[Stripe Checkout]
        B -->|Payment Success| C[Thank You Page]
        C -->|Poll Status| D[Provisioning Status API]
        D -->|Provisioned| E[Dashboard]
        E -->|Check Access| F[User API]
    end

    subgraph "Backend (API Routes)"
        G[/api/checkout] --> H[Stripe API]
        I[/api/webhook/stripe] --> J[Provisioning Service]
        K[/api/provisioning-status] --> L[Prisma DB]
        M[/api/user] --> L
    end

    subgraph "External Services"
        H[Stripe API]
        N[SQLite Database]
    end

    subgraph "Core Services"
        J[Provisioning Service]
        O[Prisma Client]
    end

    A --> G
    C --> K
    I --> J
    J --> O
    O --> N
    L --> O
    M --> O
    E --> M
```

## Directory Structure

```
stripe-prototype/
src/
  app/                          # Next.js App Router
    api/                         # API Routes
      checkout/
        route.ts                # Stripe Checkout session creation
      webhook/
        stripe/
          route.ts              # Stripe webhook handler
      provisioning-status/
        route.ts                # Provisioning status polling
      user/
        route.ts                # User data endpoint
    dashboard/
      page.tsx                  # Pro user dashboard
    thank-you/
      page.tsx                  # Post-payment polling page
    page.tsx                    # Landing page with Subscribe button
    layout.tsx                  # Root layout
    globals.css                 # Global styles
  lib/                          # Shared utilities
    prisma.ts                   # Prisma client singleton
    stripe.ts                   # Stripe client (lazy init)
    env.ts                      # Environment variables & validation
    constants.ts                # Shared constants
  services/                     # Business logic
    provision-user.ts           # Idempotent user provisioning
prisma/
  schema.prisma                 # Database schema
  dev.db                       # SQLite database file
.env.local                     # Environment variables (secrets)
.env.local.example             # Environment template
```

## Component Responsibilities

### Frontend Components

| Component | Responsibility | Dependencies |
|-----------|----------------|--------------|
| **Landing Page** | Display subscription offer, initiate checkout | `/api/checkout` |
| **Thank You Page** | Poll provisioning status, redirect when ready | `/api/provisioning-status` |
| **Dashboard** | Show user status and Pro features | `/api/user` |
| **Layout** | Global styling and structure | Tailwind/CSS |

### API Routes

| Route | Method | Responsibility | Dependencies |
|-------|--------|----------------|--------------|
| `/api/checkout` | POST | Create Stripe Checkout session | Stripe API |
| `/api/webhook/stripe` | POST | Handle Stripe webhook events | Provisioning Service |
| `/api/provisioning-status` | GET | Check user provisioning status | Prisma DB |
| `/api/user` | GET | Get current user data | Prisma DB |

### Core Services

| Service | Responsibility | Key Features |
|---------|----------------|--------------|
| **Provisioning Service** | Idempotent user provisioning | Atomic upsert, plan management |
| **Prisma Client** | Database connection management | Singleton pattern, SQLite adapter |
| **Stripe Client** | Payment processing | Lazy initialization, error handling |

## Data Flow

### 1. Subscription Initiation
```
User clicks Subscribe
  POST /api/checkout
    Create Stripe session
    Return session URL
  Redirect to Stripe Checkout
```

### 2. Payment Completion
```
Stripe processes payment
  Webhook to /api/webhook/stripe
    Verify signature
    Check idempotency (WebhookEvent table)
    Call Provisioning Service
      Update user to 'pro' plan
      Set isProvisioned = true
```

### 3. Post-Payment Flow
```
User redirected to Thank You page
  Poll /api/provisioning-status every 2s
    Check user.isProvisioned
    Return status
  When provisioned:
    Redirect to Dashboard
```

### 4. Dashboard Access
```
Dashboard loads
  GET /api/user
    Return user data
  Display based on plan:
    - 'free': Show upgrade prompt
    - 'pro': Show all features
```

## Separation of Concerns

### Frontend (UI Layer)
- **Responsibility**: User interaction, display logic, navigation
- **No**: Business logic, database access, payment processing
- **Communication**: API calls only

### API Routes (Controller Layer)
- **Responsibility**: HTTP request handling, input validation, response formatting
- **No**: Complex business logic, direct database queries (use services)
- **Communication**: Services, external APIs (Stripe)

### Services (Business Logic Layer)
- **Responsibility**: Core business rules, data transformation, idempotency
- **No**: HTTP concerns, UI logic
- **Communication**: Database only

### Database (Data Layer)
- **Responsibility**: Data persistence, relationships, constraints
- **No**: Business logic, API concerns
- **Access**: Through Prisma client only

## Key Architectural Decisions

### 1. Lazy Stripe Initialization
- **Why**: Prevents build-time crashes with placeholder keys
- **How**: `getStripe()` function creates client on first use
- **Benefit**: Works in dev/test environments without real keys

### 2. Idempotent Provisioning
- **Why**: Handle duplicate webhook deliveries safely
- **How**: `WebhookEvent` table tracks processed event IDs
- **Benefit**: Guarantees exactly-once processing

### 3. Polling-Based Status Check
- **Why**: Webhook processing is asynchronous
- **How**: Thank You page polls `/api/provisioning-status` every 2s
- **Benefit**: Smooth user experience without long-loading pages

### 4. Read-Only User API
- **Why**: UI should not trigger side effects
- **How**: `/api/user` only returns existing data or safe defaults
- **Benefit**: Prevents accidental user creation from UI

### 5. Environment Variable Decoupling
- **Why**: Avoid cascade import failures
- **How**: `TEST_USER_EMAIL` in separate constants file
- **Benefit**: Routes don't depend on Stripe module

## Security Considerations

### Webhook Security
- Stripe signature verification
- Event idempotency checking
- Error handling without exposing details

### Data Access
- Prisma adapter pattern prevents SQL injection
- Environment variables for secrets
- Read-only endpoints where appropriate

### Error Handling
- Generic error messages to users
- Detailed logging for debugging
- Graceful degradation for missing data

## Scalability Notes

### Current Limitations
- SQLite for prototype (switch to PostgreSQL for production)
- Single test user email (multi-tenant requires auth)
- In-memory Prisma client (connection pooling needed for scale)

### Production Readiness
- Replace SQLite with PostgreSQL
- Add user authentication system
- Implement connection pooling
- Add monitoring and logging
- Configure proper error reporting
