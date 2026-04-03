# Topic 01: Database

## Agents & Skills to Read First
```
agents/database-architect.md
skills/senior-backend/SKILL.md
skills/typescript-expert/SKILL.md
```

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Volunteer {
  id       String   @id @default(cuid())
  name     String
  email    String   @unique
  phone    String?
  skills   String[]
  isActive Boolean  @default(true)
  joinedAt DateTime @default(now())

  assignments         OperationAssignment[]
  impactScore         ImpactScore?
  appreciationLetters AppreciationLetter[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Donor {
  id    String  @id @default(cuid())
  name  String
  email String  @unique
  phone String?

  donations      Donation[]
  outreachDrafts DonorOutreach[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Donation {
  id      String   @id @default(cuid())
  amount  Float
  date    DateTime @default(now())
  note    String?
  donor   Donor    @relation(fields: [donorId], references: [id])
  donorId String
  createdAt DateTime @default(now())
}

model Operation {
  id          String          @id @default(cuid())
  title       String
  description String
  type        OperationType
  date        DateTime
  status      OperationStatus @default(PLANNED)
  assignments OperationAssignment[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum OperationType {
  MEAL_DELIVERY
  HOME_VISIT
  HOLIDAY_EVENT
  MEDICAL_ESCORT
  OTHER
}

enum OperationStatus {
  PLANNED
  ACTIVE
  COMPLETED
  CANCELLED
}

model OperationAssignment {
  id          String           @id @default(cuid())
  status      AssignmentStatus @default(SUGGESTED)
  volunteer   Volunteer        @relation(fields: [volunteerId], references: [id])
  volunteerId String
  operation   Operation        @relation(fields: [operationId], references: [id])
  operationId String
  createdAt   DateTime         @default(now())
  @@unique([volunteerId, operationId])
}

enum AssignmentStatus {
  SUGGESTED
  CONFIRMED
  DECLINED
}

model DonorOutreach {
  id      String         @id @default(cuid())
  draft   String
  status  OutreachStatus @default(PENDING)
  sentAt  DateTime?
  donor   Donor          @relation(fields: [donorId], references: [id])
  donorId String
  createdAt DateTime     @default(now())
}

enum OutreachStatus {
  PENDING
  SENT
  DISMISSED
}

model ImpactScore {
  id               String    @id @default(cuid())
  score            Float
  month            Int
  year             Int
  operationCount   Int
  consistencyScore Float
  activityTypes    String[]
  trend            Trend
  volunteer        Volunteer @relation(fields: [volunteerId], references: [id])
  volunteerId      String    @unique
  updatedAt        DateTime  @updatedAt
}

enum Trend {
  RISING
  STABLE
  DECLINING
}

model AppreciationLetter {
  id          String         @id @default(cuid())
  content     String
  status      OutreachStatus @default(PENDING)
  month       Int
  year        Int
  sentAt      DateTime?
  volunteer   Volunteer      @relation(fields: [volunteerId], references: [id])
  volunteerId String
  createdAt   DateTime       @default(now())
}

model Settings {
  id             String @id @default("singleton")
  councilEmail   String @default("")
  orgName        String @default("")
  orgDescription String @default("")
}

model MonthlyReport {
  id        String    @id @default(cuid())
  month     Int
  year      Int
  content   Json
  pdfUrl    String?
  sentAt    DateTime?
  createdAt DateTime  @default(now())
}
```

## lib/prisma.ts — Singleton (Vercel-safe)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Seed Data Requirements
File: `prisma/seed.ts`

Must produce demo data that makes every feature work on first run:
- 10 volunteers — varying skills and activity levels
  - "משה כהן": 5 ops this month → Top 1 impact score
  - "יעל לוי": 3 ops, 4 consecutive months → Top 2
  - "דוד מזרחי": 2 ops, rising trend → Top 3
- 8 donors
  - "יוסי כץ": avg donation every 20 days, last donation 45 days ago → COOLING
  - "רחל לוי": last donation 72 days ago → COOLING
- 12 operations
  - "חלוקת ארוחות לחג": 3 days from now, ZERO assignments → dashboard alert
  - 6 completed operations this month → for monthly report
- 25 donations spread across last 3 months
- 1 Settings record: orgName "עמותת יד לקשיש", councilEmail "council@example.com"

## After Building
```bash
npx prisma migrate dev --name init
npx prisma db seed
npx prisma studio   # verify data loaded
```
Then run: `workflows/code-review.md`
Then commit: `git commit -m "step 1: database schema + seed"`
