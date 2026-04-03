# CLAUDE.md — NGO Manager

## WAT Framework
This project uses the WAT architecture (Workflows, Agents, Tools).
Read `WAT.md` first to understand how to operate.

## How to Read Instructions
Instructions are split into topic files to preserve context window.
Read ONLY the topic file relevant to your current step — not all at once.

```
.claude/topics/01-database.md     → Step 1: Schema + Prisma
.claude/topics/02-services.md     → Step 2A: Business logic layer
.claude/topics/03-api-routes.md   → Step 2B: Route handlers
.claude/topics/04-ui-design.md    → Step 2C + 3C: All UI work
.claude/topics/05-ai-features.md  → Step 3B: AI routes + prompts
.claude/topics/06-pdf-email.md    → Step 5: PDF + email
.claude/topics/07-build-order.md  → Always read this first
```

## Agents & Skills
```
.claude/agents/nextjs-developer.md    → Read at Step 0
.claude/agents/database-architect.md  → Read at Step 1
.claude/agents/security-auditor.md    → Read before any API route

.claude/skills/senior-backend/        → Step 2A
.claude/skills/typescript-expert/     → Every step
.claude/skills/api-integration-specialist/ → Step 2B + 3B
.claude/skills/frontend-design/       → Step 2C + 3C
.claude/skills/ui-design-system/      → Step 2C + 3C
.claude/skills/react-best-practices/  → Step 2C + 3A
.claude/skills/pdf-processing-pro/    → Step 5
.claude/skills/code-reviewer/         → After EVERY step
```

## Project
- **Stack**: Next.js 14, PostgreSQL + Prisma, Tailwind + shadcn, Anthropic SDK, Resend
- **Language**: Hebrew UI (RTL), TypeScript strict mode
- **User**: Danny — NGO manager replacing Excel with an intelligent system

## Non-Negotiable Rules
- Zero `any` in TypeScript
- All AI calls server-side only — never from client
- RTL-aware Tailwind classes only: `ms-`, `me-`, `ps-`, `pe-`, `text-start`, `border-s`
- `code-reviewer` + `typescript-expert` after every step
- `security-auditor` on every API route
- Commit after every completed step

## Resuming Work
If starting a new session, read `workflows/resume-work.md` first.
