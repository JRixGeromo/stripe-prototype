'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ThankYouPage() {
  const [status, setStatus] = useState<'processing' | 'completed' | 'error' | 'timeout'>('processing')
  const router = useRouter()

  useEffect(() => {
    let elapsed = 0
    const MAX_WAIT = 60000 // 60 seconds

    const pollStatus = async () => {
      try {
        const response = await fetch('/api/provisioning-status')
        const data = await response.json()

        if (data.isProvisioned) {
          setStatus('completed')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      } catch (error) {
        console.error('Error checking provisioning status:', error)
        setStatus('error')
      }
    }

    const interval = setInterval(() => {
      elapsed += 2000
      if (elapsed >= MAX_WAIT) {
        setStatus('timeout')
        clearInterval(interval)
        return
      }
      pollStatus()
    }, 2000)

    // Initial poll
    pollStatus()

    return () => clearInterval(interval)
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '448px', width: '100%', padding: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
          Thank You!
        </h1>

        {status === 'processing' && (
          <div>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Setting up your Pro account...
            </p>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              borderTop: '2px solid #2563eb',
              margin: '0 auto',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}

        {status === 'completed' && (
          <div>
            <p style={{ color: '#059669', fontWeight: '600', marginBottom: '16px' }}>
              Your Pro account is ready!
            </p>
            <p style={{ color: '#6b7280' }}>
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'timeout' && (
          <div>
            <p style={{ color: '#d97706', fontWeight: '600', marginBottom: '16px' }}>
              Taking longer than expected
            </p>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Your payment was successful. Provisioning may take a moment.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '16px' }}>
              Something went wrong
            </p>
            <p style={{ color: '#6b7280' }}>
              Please contact support if the issue persists.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
