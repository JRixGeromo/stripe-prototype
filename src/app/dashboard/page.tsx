'use client'

import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string; plan: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Account Status</h2>
          {user ? (
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Plan:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                  user.plan === 'pro' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.plan === 'pro' ? 'PRO' : 'FREE'}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-600">Loading user information...</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className={`w-5 h-5 rounded-full mr-3 ${
                user?.plan === 'pro' ? 'bg-green-500' : 'bg-gray-300'
              }`}></span>
              <span>Advanced Analytics</span>
            </div>
            <div className="flex items-center">
              <span className={`w-5 h-5 rounded-full mr-3 ${
                user?.plan === 'pro' ? 'bg-green-500' : 'bg-gray-300'
              }`}></span>
              <span>Priority Support</span>
            </div>
            <div className="flex items-center">
              <span className={`w-5 h-5 rounded-full mr-3 ${
                user?.plan === 'pro' ? 'bg-green-500' : 'bg-gray-300'
              }`}></span>
              <span>Unlimited Projects</span>
            </div>
            <div className="flex items-center">
              <span className={`w-5 h-5 rounded-full mr-3 ${
                user?.plan === 'pro' ? 'bg-green-500' : 'bg-gray-300'
              }`}></span>
              <span>Custom Integrations</span>
            </div>
          </div>
          
          {user?.plan === 'free' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                Upgrade to Pro to unlock all features
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
