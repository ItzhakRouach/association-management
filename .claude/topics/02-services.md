# Topic 02: Services Layer

## Agents & Skills to Read First
```
skills/senior-backend/SKILL.md
skills/typescript-expert/SKILL.md
```

## Rules
- Prisma only — zero UI imports
- All functions wrapped in try/catch
- Export as named exports
- All types from `lib/types/index.ts`

## lib/types/index.ts — Single Source of Truth

```typescript
import type {
  Volunteer, Donor, Donation, Operation,
  OperationAssignment, Trend
} from '@prisma/client'

export type VolunteerWithLoad = Volunteer & {
  currentLoad: number
  assignments: OperationAssignment[]
}

export type DonorWithStats = Donor & {
  totalDonated: number
  lastDonationDate: Date | null
  daysSinceLastDonation: number
  averageDaysBetweenDonations: number
  isCooling: boolean
  donations: Donation[]
}

export type OperationWithAssignments = Operation & {
  assignments: (OperationAssignment & { volunteer: Volunteer })[]
  volunteerCount: number
}

export type AIAssignmentSuggestion = {
  volunteerId: string
  volunteerName: string
  reason: string
}

export type AIAssignmentResponse = {
  recommended: AIAssignmentSuggestion[]
  summary: string
}

export type ImpactScoreData = {
  volunteerId: string
  volunteerName: string
  score: number
  trend: Trend
  operationCount: number
  appreciationLetter?: string
}

export type AlertItem = {
  id: string
  type: 'cooling_donor' | 'unassigned_operation' | 'report_pending'
  message: string
  actionLabel: string
  actionHref: string
  severity: 'warning' | 'info' | 'urgent'
}
```

## volunteer.service.ts
```typescript
getAll(): Promise<VolunteerWithLoad[]>
getById(id: string): Promise<VolunteerWithLoad>
getActive(): Promise<VolunteerWithLoad[]>
calculateLoad(volunteerId: string): Promise<number>
// load = count of CONFIRMED assignments with future dates
```

## donor.service.ts
```typescript
getAll(): Promise<DonorWithStats[]>
getById(id: string): Promise<DonorWithStats>
findCoolingDonors(): Promise<DonorWithStats[]>
// Cooling: daysSinceLastDonation > averageDaysBetweenDonations * 1.5
```

## operation.service.ts
```typescript
getAll(): Promise<OperationWithAssignments[]>
getById(id: string): Promise<OperationWithAssignments>
getUpcoming(): Promise<OperationWithAssignments[]>
getUnassigned(): Promise<OperationWithAssignments[]>
// Unassigned: future date + zero CONFIRMED assignments
```

## impact.service.ts
```typescript
calculateScore(params: {
  monthlyOps: number
  consecutiveMonths: number
  operationTypes: string[]
  prevMonthOps: number
}): number
// operationPoints   = Math.min(monthlyOps * 8, 40)
// consistencyPoints = Math.min(consecutiveMonths * 5, 30)
// varietyPoints     = Math.min(uniqueTypes * 5, 20)
// trendPoints       = monthlyOps > prevMonthOps ? 10 : same ? 5 : 0

getTrend(current: number, previous: number): Trend
// RISING if current > previous * 1.1
// DECLINING if current < previous * 0.9
// else STABLE

getTopVolunteers(n: number): Promise<VolunteerWithLoad[]>
```

## After Building
Run: `workflows/code-review.md`
