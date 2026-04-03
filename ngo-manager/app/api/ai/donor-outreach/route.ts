import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/anthropic'
import { getDonorById } from '@/lib/services/donor.service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await request.json()
    if (
      typeof body !== 'object' ||
      body === null ||
      !('donorId' in body) ||
      typeof (body as Record<string, unknown>).donorId !== 'string'
    ) {
      return NextResponse.json({ error: 'donorId is required' }, { status: 400 })
    }

    const { donorId } = body as { donorId: string }

    const donor = await getDonorById(donorId)
    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    const recentOps = await prisma.operation.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { date: 'desc' },
      take: 5,
      select: { title: true, date: true },
    })

    const genderLabel = donor.gender === 'FEMALE' ? 'נקבה' : 'זכר'
    const prompt = `אתה עוזר לדני מנהל עמותה לשמור על קשר עם תורמים.

תורם/ת: ${donor.name}
מין: ${genderLabel}
היסטוריית תרומות: ${donor.donations.map(d => `${d.amount}₪ (${new Date(d.date).toLocaleDateString('he-IL')})`).join(', ')}
ימים מאז תרומה אחרונה: ${donor.daysSinceLastDonation}

פעילות אחרונה של העמותה:
${recentOps.map(op => `- ${op.title} (${new Date(op.date).toLocaleDateString('he-IL')})`).join('\n')}

כתוב טיוטת פנייה בעברית בהתאם למין של התורם/ת. טון חם ואישי. 150-200 מילים.
התחל ב"שלום ${donor.name},"`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const draft = message.content[0].type === 'text' ? message.content[0].text : ''

    const outreach = await prisma.donorOutreach.create({
      data: {
        donorId,
        draft,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ outreachId: outreach.id, draft })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'שגיאה לא ידועה'
    console.error('[AI donor-outreach]', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
