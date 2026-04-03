import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const donors = await prisma.donor.findMany({
      include: {
        donations: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const donorsWithStats = donors.map((donor) => {
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

      return {
        ...donor,
        totalDonated,
        lastDonationDate,
        daysSinceLastDonation,
        averageDaysBetweenDonations,
        isCooling,
      }
    })

    return NextResponse.json(donorsWithStats)
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

    const donor = await prisma.donor.create({
      data: {
        name: data.name,
        email: data.email,
        phone: typeof data.phone === 'string' ? data.phone : null,
        whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : null,
        gender: data.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
      },
    })

    return NextResponse.json(donor, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
