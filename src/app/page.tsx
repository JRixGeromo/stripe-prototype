'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'

export default function Home() {
  const { isSignedIn } = useUser()

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '448px', width: '100%', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton />
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
            Prototype App
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>
            Upgrade to Pro to unlock premium features
          </p>
          {isSignedIn ? (
            <button
              onClick={handleSubscribe}
              style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px 16px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
              Subscribe to Pro
            </button>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Sign in to subscribe
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
