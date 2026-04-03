import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LogoutButton } from './LogoutButton'

export async function Header() {
  const session = await getServerSession(authOptions)

  return (
    <header
      className="h-16 px-6 flex items-center justify-between border-b flex-shrink-0"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Left side in RTL = user info + logout */}
      <div className="flex items-center gap-3">
        <LogoutButton />
        <div
          className="h-4 w-px"
          style={{ background: 'var(--color-border)' }}
        />
        <div
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {session?.user?.name ?? 'משתמש'}
        </div>
      </div>

      {/* Right side in RTL = org name */}
      <div
        className="text-sm font-medium"
        style={{ color: 'var(--color-text-primary)' }}
      >
        עמותת יד לקשיש
      </div>
    </header>
  )
}
