# Build Order — Topic 07

Always read this before starting any step.

## Step Status Tracking
Before starting, run: `python3 tools/check-progress.py`
This will tell you exactly which step to resume from.

## Full Build Order

### Step 0: Bootstrap
```bash
npx create-next-app@latest ngo-manager --typescript --tailwind --app
cd ngo-manager
git init
git add .
git commit -m "step 0: project bootstrap"
npx shadcn@latest init
npm install prisma @prisma/client @anthropic-ai/sdk resend next-auth
npx prisma init
```
Read: `agents/nextjs-developer.md`

### Step 1: Database
Read: `.claude/topics/01-database.md`
Read: `agents/database-architect.md`
After: commit → `git commit -m "step 1: database schema + seed"`

### Step 2: [PARALLEL] Core Layer
Spawn 3 subagents:
- Subagent A → `.claude/topics/02-services.md`
- Subagent B → `.claude/topics/03-api-routes.md`
- Subagent C → `.claude/topics/04-ui-design.md` (layout only)
After all complete: commit → `git commit -m "step 2: services + API + layout"`

### Step 3: [PARALLEL] Pages + AI
Spawn 3 subagents:
- Subagent A → `.claude/topics/04-ui-design.md` (pages with data)
- Subagent B → `.claude/topics/05-ai-features.md`
- Subagent C → `.claude/topics/04-ui-design.md` (agentic components)
After all complete: commit → `git commit -m "step 3: pages + AI routes + components"`

### Step 4: Integration
Wire all components together. Run security-auditor on all routes.
Commit → `git commit -m "step 4: full integration"`

### Step 5: PDF + Email
Read: `.claude/topics/06-pdf-email.md`
Commit → `git commit -m "step 5: PDF generation + email"`

### Step 6: Polish + Delivery
Final passes: frontend-design, security-auditor, code-reviewer.
Commit → `git commit -m "step 6: polish + final review"`

## After Every Step — Mandatory
1. Run `skills/code-reviewer`
2. Run `skills/typescript-expert`
3. Fix ALL issues
4. Commit
5. Only then proceed
