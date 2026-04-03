import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    return NextResponse.json(settings ?? { orgName: '', orgDescription: '', councilEmail: '' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const data = body as Record<string, unknown>

    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: {
        orgName: typeof data.orgName === 'string' ? data.orgName : undefined,
        orgDescription: typeof data.orgDescription === 'string' ? data.orgDescription : undefined,
        councilEmail: typeof data.councilEmail === 'string' ? data.councilEmail : undefined,
      },
      create: {
        id: 'singleton',
        orgName: typeof data.orgName === 'string' ? data.orgName : '',
        orgDescription: typeof data.orgDescription === 'string' ? data.orgDescription : '',
        councilEmail: typeof data.councilEmail === 'string' ? data.councilEmail : '',
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
