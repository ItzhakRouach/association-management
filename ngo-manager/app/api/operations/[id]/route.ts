import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OperationType, OperationStatus } from '@prisma/client'

type RouteContext = { params: Promise<{ id: string }> }

const VALID_OPERATION_TYPES: OperationType[] = [
  'MEAL_DELIVERY',
  'HOME_VISIT',
  'HOLIDAY_EVENT',
  'MEDICAL_ESCORT',
  'OTHER',
]

const VALID_OPERATION_STATUSES: OperationStatus[] = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
]

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params

    const operation = await prisma.operation.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { volunteer: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 })
    }

    const volunteerCount = operation.assignments.filter((a) => a.status === 'CONFIRMED').length

    return NextResponse.json({ ...operation, volunteerCount })
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

    const existing = await prisma.operation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 })
    }

    const body: unknown = await req.json()
    const data = body as Record<string, unknown>

    let parsedDate: Date | undefined
    if (typeof data.date === 'string') {
      parsedDate = new Date(data.date)
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
      }
    }

    const validType =
      data.type && VALID_OPERATION_TYPES.includes(data.type as OperationType)
        ? (data.type as OperationType)
        : undefined
    const validStatus =
      data.status && VALID_OPERATION_STATUSES.includes(data.status as OperationStatus)
        ? (data.status as OperationStatus)
        : undefined

    const operation = await prisma.operation.update({
      where: { id },
      data: {
        ...(typeof data.title === 'string' && { title: data.title }),
        ...(typeof data.description === 'string' && { description: data.description }),
        ...(validType && { type: validType }),
        ...(parsedDate && { date: parsedDate }),
        ...(validStatus && { status: validStatus }),
      },
      include: {
        assignments: {
          include: { volunteer: true },
        },
      },
    })

    const volunteerCount = operation.assignments.filter((a) => a.status === 'CONFIRMED').length

    return NextResponse.json({ ...operation, volunteerCount })
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

    const existing = await prisma.operation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 })
    }

    await prisma.operation.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
