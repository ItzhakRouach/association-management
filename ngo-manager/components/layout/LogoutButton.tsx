'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center gap-1.5 text-sm transition-colors duration-150"
      style={{ color: 'var(--color-text-muted)' }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-danger)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'
      }}
    >
      <LogOut className="w-4 h-4" />
      <span>יציאה</span>
    </button>
  )
}
