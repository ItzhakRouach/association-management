import type { Metadata } from 'next'
import { Heebo, Frank_Ruhl_Libre, Noto_Sans_Hebrew } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ['hebrew', 'latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  variable: '--font-display',
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NGO Manager — עמותת יד לקשיש',
  description: 'מערכת ניהול עמותה לסיוע לקשישים',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${notoSansHebrew.variable} ${frankRuhl.variable}`}>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
