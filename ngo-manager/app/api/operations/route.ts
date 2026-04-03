import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OperationType, OperationStatus } from '@prisma/client'

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

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const operations = await prisma.operation.findMany({
      include: {
        assignments: {
          include: { volunteer: true },
        },
      },
      orderBy: { date: 'desc' },
    })

    const operationsWithCount = operations.map((op) => ({
      ...op,
      volunteerCount: op.assignments.filter((a) => a.status === 'CONFIRMED').length,
    }))

    return NextResponse.json(operationsWithCount)
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

    if (!data.title || typeof data.title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!data.description || typeof data.description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    if (!data.type || !VALID_OPERATION_TYPES.includes(data.type as OperationType)) {
      return NextResponse.json({ error: 'Valid type is required' }, { status: 400 })
    }
    if (!data.date || typeof data.date !== 'string') {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const parsedDate = new Date(data.date)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const status =
      data.status && VALID_OPERATION_STATUSES.includes(data.status as OperationStatus)
        ? (data.status as OperationStatus)
        : 'PLANNED'

    const operation = await prisma.operation.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type as OperationType,
        date: parsedDate,
        status,
      },
      include: {
        assignments: {
          include: { volunteer: true },
        },
      },
    })

    return NextResponse.json(
      { ...operation, volunteerCount: 0 },
      { status: 201 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
