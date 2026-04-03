# Topic 04: UI & Design System

## Skills to Read First
```
skills/frontend-design/SKILL.md
skills/ui-design-system/SKILL.md
skills/react-best-practices/SKILL.md
```

## Aesthetic Direction
Refined Professional Dark — serious, clean, trustworthy.
Like a leading financial SaaS. Not a toy dashboard.

## CSS Variables — globals.css
```css
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&family=Frank+Ruhl+Libre:wght@400;700&display=swap');

:root {
  --color-bg:            #0f1923;
  --color-surface:       #162030;
  --color-surface-2:     #1d2d3e;
  --color-border:        #243447;
  --color-accent:        #d4a017;
  --color-accent-hover:  #e8b420;
  --color-text-primary:  #f0f4f8;
  --color-text-secondary:#8fa3b8;
  --color-text-muted:    #4a6278;
  --color-success:       #22c55e;
  --color-warning:       #f59e0b;
  --color-danger:        #ef4444;
  --font-body:           'Heebo', sans-serif;
  --font-display:        'Frank Ruhl Libre', serif;
  --radius-md:           10px;
  --radius-lg:           16px;
  --shadow-card:         0 4px 24px rgba(0,0,0,0.4);
}
```

## RTL — Non-Negotiable
```tsx
// Root layout
<html lang="he" dir="rtl">

// ✅ Use ONLY these Tailwind classes
ms-  me-  ps-  pe-          // margin/padding start/end
text-start  text-end        // alignment
border-s  border-e          // borders
rounded-s  rounded-e        // rounding

// ❌ NEVER use
ml-  mr-  pl-  pr-
text-left  text-right
border-l  border-r
```

## Layout — Sidebar on Right
```tsx
<div className="flex flex-row-reverse min-h-screen bg-[var(--color-bg)]">
  <aside className="w-64 bg-[var(--color-surface)] border-s border-[var(--color-border)]" />
  <main className="flex-1" />
</div>
```

## Component Patterns

### Stats Card
```tsx
<div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)]
                border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]
                hover:border-[var(--color-accent)] transition-colors duration-200">
  <p className="text-[var(--color-text-secondary)] text-sm font-medium mb-2">{label}</p>
  <p className="text-4xl font-bold text-[var(--color-accent)]">{value}</p>
</div>
```

### Alert Card
```tsx
<div className="border-s-4 border-[var(--color-warning)]
                bg-[var(--color-surface-2)] rounded-e-[var(--radius-md)] p-4
                flex items-center justify-between">
```

### AI Suggestion Card
```tsx
<div className="border border-[var(--color-accent)]/30
                bg-gradient-to-l from-[var(--color-accent)]/5 to-transparent
                rounded-[var(--radius-md)] p-4">
```

### AI Loading State
```tsx
<div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
  <div className="w-4 h-4 border-2 border-[var(--color-accent)]
                  border-t-transparent rounded-full animate-spin" />
  <span className="text-sm">מנתח נתונים...</span>
</div>
```

### AI Result Reveal
```tsx
<div className="animate-in fade-in duration-300">{results}</div>
```

## Fonts
- H1/H2 only: `font-family: var(--font-display)` (Frank Ruhl Libre)
- Everything else: `font-family: var(--font-body)` (Heebo)
- FORBIDDEN: Inter, Arial, Roboto, system-ui

## Dashboard Layout
```
ROW 1 — 4 KPI Stats cards
ROW 2 — AlertsPanel (cooling donors, unassigned ops, pending report)
ROW 3 — RecentOperations | RecentDonations
```

## Performance (Server Components)
```typescript
// Parallel data fetching — ALWAYS use Promise.all, never sequential awaits
const [volunteers, donors, operations] = await Promise.all([
  volunteerService.getActive(),
  donorService.findCoolingDonors(),
  operationService.getUnassigned(),
])
```

## Forbidden
- White or light backgrounds
- `rounded-full` on primary action buttons
- Text smaller than 12px
- Display font below H2
- Sequential data fetching (use Promise.all)
