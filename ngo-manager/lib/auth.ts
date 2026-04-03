import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const adminEmail = process.env.ADMIN_EMAIL ?? 'danny@ngo.org'
        const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme123'
        if (credentials.email !== adminEmail) return null
        const isValid = credentials.password === adminPassword
        if (!isValid) return null
        return { id: '1', name: 'Danny', email: adminEmail }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
}
