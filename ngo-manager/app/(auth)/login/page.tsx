'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('כתובת אימייל או סיסמה שגויים. נסה שנית.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('אירעה שגיאה. נסה שנית.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-md rounded-[var(--radius-lg)] border p-8"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-accent)',
            }}
          >
            יד לקשיש
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            מערכת ניהול עמותה
          </p>
          <div
            className="mt-6 h-px w-12 mx-auto"
            style={{ background: 'var(--color-border)' }}
          />
          <h2
            className="text-xl font-semibold mt-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            כניסה למערכת
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              כתובת אימייל
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="danny@ngo.org"
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] text-sm outline-none transition-colors duration-150"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-accent)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)'
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] text-sm outline-none transition-colors duration-150"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-accent)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)'
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-[var(--radius-md)] text-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--color-danger)',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-colors duration-150 mt-2 flex items-center justify-center gap-2"
            style={{
              background: isLoading ? 'var(--color-text-muted)' : 'var(--color-accent)',
              color: 'var(--color-bg)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                ;(e.target as HTMLButtonElement).style.background =
                  'var(--color-accent-hover)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                ;(e.target as HTMLButtonElement).style.background = 'var(--color-accent)'
              }
            }}
          >
            {isLoading && (
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-bg)', borderTopColor: 'transparent' }}
              />
            )}
            {isLoading ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  )
}
