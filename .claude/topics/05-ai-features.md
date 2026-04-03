# Topic 05: AI Features

## Skills to Read First
```
skills/api-integration-specialist/SKILL.md
agents/security-auditor.md
```

## Rule: AI calls server-side ONLY
Never call Anthropic from a Client Component. Only from Route Handlers.

## lib/anthropic.ts

```typescript
import Anthropic from '@anthropic-ai/sdk'

const globalForAnthropic = globalThis as unknown as { anthropic: Anthropic }
export const anthropic = globalForAnthropic.anthropic ?? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
if (process.env.NODE_ENV !== 'production') globalForAnthropic.anthropic = anthropic

// Helper: parse JSON from Claude response safely
export function parseJSON<T>(text: string): T {
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as T
}
```

## Feature 1 — Volunteer Assignment
Route: `POST /api/ai/assign-volunteers`
Body: `{ operationId: string }`

```typescript
// Prompt
`אתה עוזר לדני מנהל עמותה לשייך מתנדבים למבצעים.

מבצע: ${operation.title}
תיאור: ${operation.description}
סוג: ${operation.type}
תאריך: ${operation.date}

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
```

Response: save nothing to DB. Return `AIAssignmentResponse` directly.

## Feature 2 — Donor Outreach
Route: `POST /api/ai/donor-outreach`
Body: `{ donorId: string }`

```typescript
// Prompt
`אתה עוזר לדני מנהל עמותה לשמור על קשר עם תורמים.

תורם: ${donor.name}
היסטוריית תרומות: ${donor.donations.map(d => `${d.amount}₪ (${d.date})`).join(', ')}
ימים מאז תרומה אחרונה: ${donor.daysSinceLastDonation}

פעילות אחרונה של העמותה:
${recentOps.map(op => `- ${op.title} (${op.date})`).join('\n')}

כתוב טיוטת פנייה בעברית. טון חם ואישי. 150-200 מילים.
התחל ב"שלום ${donor.name},"`
```

Response: save draft to `DonorOutreach` table (status: PENDING). Return `{ outreachId, draft }`.

## Feature 3 — Monthly Report
Route: `POST /api/ai/monthly-report`
Body: `{ month: number, year: number }`

```typescript
// Prompt
`אתה כותב דוחות מקצועיים לעמותות בעברית.

דוח לחודש ${month}/${year}:
מבצעים: ${operations.length} התקיימו
${operations.map(op => `- ${op.title}: ${op.assignments.length} מתנדבים`).join('\n')}
תרומות: ${totalDonations}₪ מ-${donorCount} תורמים

כתוב דוח למועצה. מבנה: פתיחה → הישגים → נתונים → תודות → סיום
טון רשמי אך חם. 400-500 מילים.`
```

Response: save to `MonthlyReport` table. Return `{ reportId, narrative }`.

## Feature 4 — Impact Scores + Letters
Route: `POST /api/ai/impact-scores`
Body: `{}`

Flow:
1. Fetch all volunteers with assignments
2. Calculate score per volunteer using `impact.service.ts`
3. Save/update `ImpactScore` records
4. Get top 3
5. For each top 3 — call Claude:

```typescript
// Prompt per volunteer
`אתה כותב מכתבי הוקרה למתנדבים מצטיינים.

מתנדב: ${volunteer.name}
ציון: ${score}/100 (מגמה: ${trend})
מבצעים החודש: ${operations.map(op => op.title).join(', ')}

כתוב מכתב הוקרה אישי. לא גנרי — התייחס לפעילות הספציפית.
120-150 מילים. התחל ב"שלום ${volunteer.name},"`
```

6. Save `AppreciationLetter` records (status: PENDING)
7. Return `{ topVolunteers: ImpactScoreData[], letters }`

## After Building
Run: `workflows/code-review.md`
