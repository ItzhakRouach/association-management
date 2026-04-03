# Workflow: Code Review

## Objective
Run a thorough code review after every build step before committing.

## Steps

### 1. Read the skills
```
Read .claude/skills/code-reviewer/SKILL.md
Read .claude/skills/typescript-expert/SKILL.md
```

### 2. Review checklist

**TypeScript:**
- [ ] Zero `any` or `@ts-ignore`
- [ ] All functions have explicit return types
- [ ] All types imported from `lib/types/index.ts`

**RTL:**
- [ ] No `ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`, `border-l`, `border-r`
- [ ] All directional classes use `ms-`, `me-`, `ps-`, `pe-`, `text-start`, `border-s`
- [ ] Sidebar is on the RIGHT side

**Security:**
- [ ] All API routes check authentication via `getServerSession()`
- [ ] No raw DB errors exposed to client
- [ ] No API keys in client-side code
- [ ] All inputs validated before use

**Architecture:**
- [ ] No AI calls from Client Components
- [ ] Prisma only imported from `lib/prisma.ts` singleton
- [ ] No types defined locally — all from `lib/types/index.ts`
- [ ] Server Components by default, Client only when interactive

**Error handling:**
- [ ] Every async function has try/catch
- [ ] Proper HTTP status codes in route handlers

### 3. Fix all issues
Do not proceed until every item above passes.

### 4. Commit
```bash
git add .
git commit -m "step X: [description] + code review fixes"
```
