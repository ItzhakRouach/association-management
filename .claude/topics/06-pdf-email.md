# Topic 06: PDF + Email

## Skills to Read First
```
skills/pdf-processing-pro/SKILL.md
skills/api-integration-specialist/SKILL.md
```

## lib/pdf.ts
Generate a professional Hebrew PDF for the monthly council report.

```typescript
// Function signature
export async function generateReportPDF(params: {
  month: number
  year: number
  orgName: string
  narrative: string
  operationCount: number
  volunteerCount: number
  totalDonations: number
  donorCount: number
  operations: { title: string; volunteerCount: number }[]
}): Promise<Buffer>
```

PDF Layout (RTL, Hebrew):
1. Header: org name + report title + month/year
2. Stats row: 4 boxes with key numbers
3. Operations list
4. Narrative text (from Claude)
5. Footer: "הופק אוטומטית ע"י מערכת ניהול העמותה"

## lib/resend.ts
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  attachment?: { filename: string; content: Buffer }
}): Promise<void>
```

## Update /api/ai/monthly-report
After generating narrative:
1. Generate PDF using `lib/pdf.ts`
2. Send to `Settings.councilEmail` via `lib/resend.ts`
3. Update `MonthlyReport` record with `sentAt`

## reports/page.tsx
- List of past MonthlyReport records with sent status
- "שלח דוח חודשי" button → calls `/api/ai/monthly-report`
- Loading state during generation (can take 10–15 seconds)
- Success: show "נשלח ✓" with timestamp

## After Building
Run: `workflows/code-review.md`
Then commit: `git commit -m "step 5: PDF generation + email"`
