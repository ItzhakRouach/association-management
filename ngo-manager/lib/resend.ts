import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  attachment?: { filename: string; content: Buffer }
}): Promise<void> {
  const payload: Parameters<typeof resend.emails.send>[0] = {
    from: process.env.RESEND_FROM_EMAIL ?? 'ngo@example.com',
    to: params.to,
    subject: params.subject,
    html: params.html,
  }

  if (params.attachment) {
    payload.attachments = [
      {
        filename: params.attachment.filename,
        content: params.attachment.content,
      },
    ]
  }

  const { error } = await resend.emails.send(payload)
  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}
