'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Heart,
  Calendar,
  FileText,
  Settings,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'דשבורד', icon: LayoutDashboard },
  { href: '/volunteers', label: 'מתנדבים', icon: Users },
  { href: '/donors', label: 'תורמים', icon: Heart },
  { href: '/operations', label: 'מבצעים', icon: Calendar },
  { href: '/reports', label: 'דוחות', icon: FileText },
  { href: '/settings', label: 'הגדרות', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-64 flex flex-col min-h-screen sticky top-0 border-e"
      style={{
        background: 'var(--color-sidebar-bg)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Logo area */}
      <div
        className="p-6 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <h1
          className="text-xl font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#ffffff',
          }}
        >
          יד לקשיש
        </h1>
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--color-sidebar-muted)' }}
        >
          מערכת ניהול עמותה
        </p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors duration-150"
              style={
                isActive
                  ? {
                      borderInlineStart: '3px solid var(--color-accent)',
                      color: '#ffffff',
                      background: 'rgba(255,255,255,0.12)',
                      paddingInlineStart: 'calc(0.75rem - 3px)',
                    }
                  : {
                      color: 'var(--color-sidebar-text)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget
                  el.style.color = '#ffffff'
                  el.style.background = 'rgba(255,255,255,0.08)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget
                  el.style.color = 'var(--color-sidebar-text)'
                  el.style.background = ''
                }
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <p
          className="text-xs text-center"
          style={{ color: 'var(--color-sidebar-muted)' }}
        >
          © {new Date().getFullYear()} עמותת יד לקשיש
        </p>
      </div>
    </aside>
  )
}
