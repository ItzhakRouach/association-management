import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const volunteers = await prisma.volunteer.findMany({
      include: {
        assignments: {
          where: { status: { in: ['SUGGESTED', 'CONFIRMED'] } },
        },
        impactScore: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const volunteersWithLoad = volunteers.map((v) => ({
      ...v,
      currentLoad: v.assignments.filter((a) => a.status === 'CONFIRMED').length,
    }))

    return NextResponse.json(volunteersWithLoad)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const data = body as Record<string, unknown>

    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!data.email || typeof data.email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: typeof data.phone === 'string' ? data.phone : null,
        whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : null,
        skills: Array.isArray(data.skills) ? (data.skills as string[]) : [],
        isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      },
    })

    return NextResponse.json(volunteer, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
