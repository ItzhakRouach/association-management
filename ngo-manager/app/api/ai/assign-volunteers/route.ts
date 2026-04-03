import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic, parseJSON } from '@/lib/anthropic'
import { getActiveVolunteers } from '@/lib/services/volunteer.service'
import type { AIAssignmentResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await request.json()
    if (
      typeof body !== 'object' ||
      body === null ||
      !('operationId' in body) ||
      typeof (body as Record<string, unknown>).operationId !== 'string'
    ) {
      return NextResponse.json({ error: 'operationId is required' }, { status: 400 })
    }

    const { operationId } = body as { operationId: string }

    const operation = await prisma.operation.findUnique({ where: { id: operationId } })
    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 })
    }

    const volunteers = await getActiveVolunteers()

    const prompt = `אתה עוזר לדני מנהל עמותה לשייך מתנדבים למבצעים.

מבצע: ${operation.title}
תיאור: ${operation.description}
סוג: ${operation.type}
תאריך: ${operation.date.toISOString().split('T')[0]}

מתנדבים זמינים:
${volunteers.map(v =>
  `- ${v.name} | כישורים: ${v.skills.join(', ')} | מבצעים פעילים: ${v.currentLoad}`
).join('\n')}

החזר JSON בלבד:
{
  "recommended": [
    {"volunteerId": "...", "volunteerName": "...", "reason": "הסבר קצר"}
  ],
  "summary": "משפט הסבר אחד לדני"
}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = parseJSON<AIAssignmentResponse>(text)
    return NextResponse.json(result)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'שגיאה לא ידועה'
    console.error('[AI assign-volunteers]', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
