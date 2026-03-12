import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' as const },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'tokify2024secretkey32charslong!!',
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          
          if (!user || !user.password) {
            throw new Error('No user found with this email')
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === 'google') {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email! },
          })
          if (!existing) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image,
                password: '', // OAuth users don't have passwords
              },
            })
          }
        } catch (error) {
          console.error('Google signin error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }: any) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }: any) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
