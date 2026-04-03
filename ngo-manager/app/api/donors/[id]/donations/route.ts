import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params

    const donor = await prisma.donor.findUnique({ where: { id } })
    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    const body: unknown = await req.json()
    const data = body as Record<string, unknown>

    if (data.amount === undefined || data.amount === null) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }
    const amount = Number(data.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    const donation = await prisma.donation.create({
      data: {
        amount,
        donorId: id,
        date: typeof data.date === 'string' ? new Date(data.date) : new Date(),
        note: typeof data.note === 'string' ? data.note : null,
      },
    })

    // Send automatic thank-you email (non-blocking — don't fail the request on email error)
    if (donor.email) {
      const amountFormatted = amount.toLocaleString('he-IL')
      const html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8; color: #1a2e44; max-width: 560px; margin: 0 auto;">
          <p style="font-size: 18px; font-weight: bold;">שלום ${donor.name},</p>
          <p>תודה רבה על תרומתך הנדיבה בסך <strong>₪${amountFormatted}</strong> לעמותת יד לקשיש.</p>
          <p>תרומתך מסייעת לנו להמשיך ולתמוך בקשישים ובמשפחות שזקוקים לעזרה.</p>
          <p>אנו מוקירים מאוד את תמיכתך ואת מחויבותך לקהילה.</p>
          <br/>
          <p>בברכה,<br/>צוות עמותת יד לקשיש</p>
        </div>
      `
      sendEmail({
        to: donor.email,
        subject: `תודה על תרומתך — ₪${amountFormatted}`,
        html,
      }).catch((err: unknown) => {
        console.error('[donations] Failed to send thank-you email:', err)
      })
    }

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
