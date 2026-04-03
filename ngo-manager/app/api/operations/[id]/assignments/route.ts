import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AssignmentStatus } from '@prisma/client'

type RouteContext = { params: Promise<{ id: string }> }

const VALID_ASSIGNMENT_STATUSES: AssignmentStatus[] = ['SUGGESTED', 'CONFIRMED', 'DECLINED']

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params

    const operation = await prisma.operation.findUnique({ where: { id } })
    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 })
    }

    const assignments = await prisma.operationAssignment.findMany({
      where: { operationId: id },
      include: { volunteer: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params

    const operation = await prisma.operation.findUnique({ where: { id } })
    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 })
    }

    const body: unknown = await req.json()
    const data = body as Record<string, unknown>

    if (!data.volunteerId || typeof data.volunteerId !== 'string') {
      return NextResponse.json({ error: 'volunteerId is required' }, { status: 400 })
    }

    const volunteer = await prisma.volunteer.findUnique({ where: { id: data.volunteerId } })
    if (!volunteer) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 })
    }

    const status =
      data.status && VALID_ASSIGNMENT_STATUSES.includes(data.status as AssignmentStatus)
        ? (data.status as AssignmentStatus)
        : 'SUGGESTED'

    const assignment = await prisma.operationAssignment.create({
      data: {
        volunteerId: data.volunteerId,
        operationId: id,
        status,
      },
      include: { volunteer: true },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params

    const operation = await prisma.operation.findUnique({ where: { id } })
    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 })
    }

    const body: unknown = await req.json()
    const data = body as Record<string, unknown>

    if (!data.assignmentId || typeof data.assignmentId !== 'string') {
      return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 })
    }
    if (!data.status || !VALID_ASSIGNMENT_STATUSES.includes(data.status as AssignmentStatus)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 })
    }

    const existing = await prisma.operationAssignment.findUnique({
      where: { id: data.assignmentId },
    })
    if (!existing || existing.operationId !== id) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const assignment = await prisma.operationAssignment.update({
      where: { id: data.assignmentId },
      data: { status: data.status as AssignmentStatus },
      include: { volunteer: true },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
