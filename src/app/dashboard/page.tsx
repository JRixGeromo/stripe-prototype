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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          borderTop: '2px solid #2563eb',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Dashboard</h1>
        
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Account Status</h2>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#374151' }}><span style={{ fontWeight: '500' }}>Email:</span> {user.email}</p>
              <p style={{ color: '#374151' }}><span style={{ fontWeight: '500' }}>Plan:</span> 
                <span style={{ 
                  marginLeft: '8px', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  backgroundColor: user.plan === 'pro' ? '#dcfce7' : '#f3f4f6',
                  color: user.plan === 'pro' ? '#166534' : '#374151'
                }}>
                  {user.plan === 'pro' ? 'PRO' : 'FREE'}
                </span>
              </p>
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>Loading user information...</p>
          )}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Features</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                marginRight: '12px',
                backgroundColor: user?.plan === 'pro' ? '#10b981' : '#d1d5db'
              }}></span>
              <span style={{ color: '#374151' }}>Advanced Analytics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                marginRight: '12px',
                backgroundColor: user?.plan === 'pro' ? '#10b981' : '#d1d5db'
              }}></span>
              <span style={{ color: '#374151' }}>Priority Support</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                marginRight: '12px',
                backgroundColor: user?.plan === 'pro' ? '#10b981' : '#d1d5db'
              }}></span>
              <span style={{ color: '#374151' }}>Unlimited Projects</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                marginRight: '12px',
                backgroundColor: user?.plan === 'pro' ? '#10b981' : '#d1d5db'
              }}></span>
              <span style={{ color: '#374151' }}>Custom Integrations</span>
            </div>
          </div>
          
          {user?.plan === 'free' && (
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <p style={{ color: '#1d4ed8', fontSize: '14px' }}>
                Upgrade to Pro to unlock all features
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
