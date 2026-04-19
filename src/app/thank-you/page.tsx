'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ThankYouPage() {
  const [status, setStatus] = useState<'processing' | 'completed' | 'error'>('processing')
  const router = useRouter()

  useEffect(() => {
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

    const interval = setInterval(pollStatus, 2000)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You!
        </h1>
        
        {status === 'processing' && (
          <div>
            <p className="text-gray-600 mb-4">
              Setting up your Pro account...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {status === 'completed' && (
          <div>
            <p className="text-green-600 font-semibold mb-4">
              Your Pro account is ready!
            </p>
            <p className="text-gray-600">
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className="text-red-600 font-semibold mb-4">
              Something went wrong
            </p>
            <p className="text-gray-600">
              Please contact support if the issue persists.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
