import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await request.json()
    if (
      typeof body !== 'object' ||
      body === null ||
      !('letterId' in body) ||
      !('content' in body) ||
      typeof (body as Record<string, unknown>).letterId !== 'string' ||
      typeof (body as Record<string, unknown>).content !== 'string'
    ) {
      return NextResponse.json({ error: 'letterId and content are required strings' }, { status: 400 })
    }

    const { letterId, content } = body as { letterId: string; content: string }

    const letter = await prisma.appreciationLetter.findUnique({
      where: { id: letterId },
      include: { volunteer: true },
    })

    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
    }

    await prisma.appreciationLetter.update({
      where: { id: letterId },
      data: { status: 'SENT' },
    })

    // Try to send email — non-blocking
    try {
      const toEmail = process.env.ADMIN_EMAIL ?? letter.volunteer.email
      if (toEmail) {
        await sendEmail({
          to: toEmail,
          subject: `[דמו] מכתב הוקרה ל-${letter.volunteer.name} מעמותת יד לקשיש`,
          html: `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;"><p style="color:#888;font-size:12px;">[דמו — בפועל ישלח אל: ${letter.volunteer.email}]</p>${content.replace(/\n/g, '<br/>')}</div>`,
        })
      }
    } catch (emailErr) {
      console.warn('[send-letter] email skipped:', emailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[volunteers/send-letter]', error)
    return NextResponse.json({ error: 'Failed to send letter' }, { status: 500 })
  }
}
