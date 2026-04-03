import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params

    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { operation: true },
          orderBy: { createdAt: 'desc' },
        },
        impactScore: true,
        appreciationLetters: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    const currentLoad = volunteer.assignments.filter((a) => a.status === 'CONFIRMED').length

    return NextResponse.json({ ...volunteer, currentLoad })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params

    const existing = await prisma.volunteer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    const body: unknown = await req.json()
    const data = body as Record<string, unknown>

    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: {
        ...(typeof data.name === 'string' && { name: data.name }),
        ...(typeof data.email === 'string' && { email: data.email }),
        ...(data.phone !== undefined && { phone: typeof data.phone === 'string' ? data.phone : null }),
        ...(data.whatsapp !== undefined && { whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : null }),
        ...(Array.isArray(data.skills) && { skills: data.skills as string[] }),
        ...(typeof data.isActive === 'boolean' && { isActive: data.isActive }),
      },
    })

    return NextResponse.json(volunteer)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params

    const existing = await prisma.volunteer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    await prisma.volunteer.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
