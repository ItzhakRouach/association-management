# Topic 03: API Routes

## Agents & Skills to Read First
```
agents/security-auditor.md
skills/api-integration-specialist/SKILL.md
skills/typescript-expert/SKILL.md
```

## Security Rules — Every Route
```typescript
// At the top of EVERY route handler:
const session = await getServerSession(authOptions)
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```
- Validate all request body fields before using
- Never expose raw Prisma errors to client — catch and return generic message
- Return proper HTTP codes: 200, 201, 400, 401, 404, 500

## CRUD Routes to Build

### /api/volunteers — GET, POST
### /api/volunteers/[id] — GET, PUT, DELETE
### /api/donors — GET, POST
### /api/donors/[id] — GET, PUT, DELETE
### /api/donors/[id]/donations — POST
### /api/operations — GET, POST
### /api/operations/[id] — GET, PUT, DELETE
### /api/operations/[id]/assignments — GET, POST, PATCH (update status)

## Pattern for Every Route Handler
```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // use service or prisma directly
    const data = await prisma.volunteer.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[VOLUNTEERS_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## After Building
Run: `workflows/code-review.md`
