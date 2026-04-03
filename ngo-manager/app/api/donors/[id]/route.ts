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

    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        donations: { orderBy: { date: 'desc' } },
        outreachDrafts: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    const totalDonated = donor.donations.reduce((sum, d) => sum + d.amount, 0)
    const lastDonationDate = donor.donations[0]?.date ?? null
    const now = new Date()
    const daysSinceLastDonation = lastDonationDate
      ? Math.floor((now.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    let averageDaysBetweenDonations = 0
    if (donor.donations.length >= 2) {
      const sorted = [...donor.donations].sort((a, b) => a.date.getTime() - b.date.getTime())
      const gaps: number[] = []
      for (let i = 1; i < sorted.length; i++) {
        gaps.push(
          Math.floor(
            (sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      }
      averageDaysBetweenDonations = gaps.reduce((s, g) => s + g, 0) / gaps.length
    }

    const isCooling =
      averageDaysBetweenDonations > 0 &&
      daysSinceLastDonation > averageDaysBetweenDonations * 1.5

    return NextResponse.json({
      ...donor,
      totalDonated,
      lastDonationDate,
      daysSinceLastDonation,
      averageDaysBetweenDonations,
      isCooling,
    })
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

    const existing = await prisma.donor.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    const body: unknown = await req.json()
    const data = body as Record<string, unknown>

    const donor = await prisma.donor.update({
      where: { id },
      data: {
        ...(typeof data.name === 'string' && { name: data.name }),
        ...(typeof data.email === 'string' && { email: data.email }),
        ...(data.phone !== undefined && { phone: typeof data.phone === 'string' ? data.phone : null }),
        ...(data.whatsapp !== undefined && { whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : null }),
        ...(data.gender !== undefined && { gender: data.gender === 'FEMALE' ? 'FEMALE' as const : 'MALE' as const }),
      },
    })

    return NextResponse.json(donor)
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

    const existing = await prisma.donor.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    await prisma.donor.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
