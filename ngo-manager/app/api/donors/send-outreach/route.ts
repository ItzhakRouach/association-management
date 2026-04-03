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
      !('outreachId' in body) ||
      !('content' in body) ||
      typeof (body as Record<string, unknown>).outreachId !== 'string' ||
      typeof (body as Record<string, unknown>).content !== 'string'
    ) {
      return NextResponse.json({ error: 'outreachId and content are required strings' }, { status: 400 })
    }

    const { outreachId, content } = body as { outreachId: string; content: string }

    const outreach = await prisma.donorOutreach.findUnique({
      where: { id: outreachId },
      include: { donor: true },
    })

    if (!outreach) {
      return NextResponse.json({ error: 'Outreach not found' }, { status: 404 })
    }

    // Always mark as sent in DB first
    await prisma.donorOutreach.update({
      where: { id: outreachId },
      data: { status: 'SENT', draft: content, sentAt: new Date() },
    })

    // Try to send email — non-blocking, failure doesn't break the action
    let emailSent = false
    try {
      const toEmail = process.env.ADMIN_EMAIL ?? outreach.donor.email
      if (toEmail) {
        await sendEmail({
          to: toEmail,
          subject: `[דמו] פנייה אישית ל-${outreach.donor.name} מעמותת יד לקשיש`,
          html: `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;"><p style="color:#888;font-size:12px;">[דמו — בפועל ישלח אל: ${outreach.donor.email}]</p>${content.replace(/\n/g, '<br/>')}</div>`,
        })
        emailSent = true
      }
    } catch (emailErr) {
      console.warn('[send-outreach] email skipped:', emailErr)
    }

    return NextResponse.json({ ok: true, emailSent })
  } catch (error) {
    console.error('[donors/send-outreach]', error)
    return NextResponse.json({ error: 'Failed to send outreach' }, { status: 500 })
  }
}
