#!/usr/bin/env python3
"""
tools/check-progress.py
Checks the current build state of the NGO Manager project.
Run this at the start of every session to know where to resume.
"""

import os
import subprocess
from pathlib import Path

# ANSI colors
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"

def check(path: str) -> bool:
    """Check if path exists. Handles wildcards and Next.js route groups."""
    import glob as glob_mod
    p = Path(path)
    if p.exists():
        return True
    # Handle wildcard paths (for Next.js route groups)
    if '*' in path or '(' in path:
        return bool(glob_mod.glob(path, recursive=True))
    return False

def check_any(paths: list) -> bool:
    return any(check(p) for p in paths)

def git_log() -> str:
    try:
        result = subprocess.run(
            ["git", "log", "--oneline", "-10"],
            capture_output=True, text=True
        )
        return result.stdout.strip()
    except:
        return "No git history"

def git_status() -> str:
    try:
        result = subprocess.run(
            ["git", "status", "--short"],
            capture_output=True, text=True
        )
        return result.stdout.strip()
    except:
        return "Git not initialized"

steps = [
    {
        "name": "Step 0: Bootstrap",
        "checks": [
            "package.json",
            "next.config.ts",
            "tailwind.config.ts",
            "tsconfig.json",
            ".gitignore",
        ],
        "required": ["package.json", "next.config.ts"],
    },
    {
        "name": "Step 1: Database",
        "checks": [
            "prisma/schema.prisma",
            "prisma/seed.ts",
            "prisma/migrations",
            "lib/prisma.ts",
        ],
        "required": ["prisma/schema.prisma", "lib/prisma.ts"],
    },
    {
        "name": "Step 2A: Services",
        "checks": [
            "lib/services/volunteer.service.ts",
            "lib/services/donor.service.ts",
            "lib/services/operation.service.ts",
            "lib/services/impact.service.ts",
            "lib/types/index.ts",
        ],
        "required": ["lib/services/volunteer.service.ts", "lib/types/index.ts"],
    },
    {
        "name": "Step 2B: API CRUD Routes",
        "checks": [
            "app/api/volunteers/route.ts",
            "app/api/donors/route.ts",
            "app/api/operations/route.ts",
        ],
        "required": ["app/api/volunteers/route.ts"],
    },
    {
        "name": "Step 2C: Layout + Design System",
        "checks": [
            "app/layout.tsx",
            "app/globals.css",
            "app/*/layout.tsx",
            "components/layout/Sidebar.tsx",
            "components/layout/Header.tsx",
            "components/shared/LoadingSpinner.tsx",
            "components/shared/EmptyState.tsx",
        ],
        "required": ["components/layout/Sidebar.tsx", "app/globals.css"],
    },
    {
        "name": "Step 3A: Pages",
        "checks": [
            "app/*/dashboard/page.tsx",
            "app/*/volunteers/page.tsx",
            "app/*/donors/page.tsx",
            "app/*/operations/page.tsx",
        ],
        "required": ["app/*/dashboard/page.tsx"],
    },
    {
        "name": "Step 3B: AI Routes",
        "checks": [
            "lib/anthropic.ts",
            "app/api/ai/assign-volunteers/route.ts",
            "app/api/ai/donor-outreach/route.ts",
            "app/api/ai/monthly-report/route.ts",
            "app/api/ai/impact-scores/route.ts",
        ],
        "required": ["lib/anthropic.ts", "app/api/ai/assign-volunteers/route.ts"],
    },
    {
        "name": "Step 3C: Agentic Components",
        "checks": [
            "components/operations/AssignmentSuggestions.tsx",
            "components/donors/OutreachDraftCard.tsx",
            "components/dashboard/AlertsPanel.tsx",
            "components/impact/ImpactLeaderboard.tsx",
            "components/impact/AppreciationLetterCard.tsx",
        ],
        "required": ["components/operations/AssignmentSuggestions.tsx"],
    },
    {
        "name": "Step 4: Integration",
        "checks": [
            "app/*/volunteers/impact/page.tsx",
            "app/*/settings/page.tsx",
        ],
        "required": ["app/*/settings/page.tsx"],
    },
    {
        "name": "Step 5: PDF + Email",
        "checks": [
            "lib/pdf.ts",
            "lib/resend.ts",
            "app/*/reports/page.tsx",
        ],
        "required": ["lib/pdf.ts", "lib/resend.ts"],
    },
    {
        "name": "Step 6: Polish",
        "checks": [
            ".env.example",
            "README.md",
        ],
        "required": [".env.example", "README.md"],
    },
]

def main():
    print(f"\n{BOLD}{'='*55}{RESET}")
    print(f"{BOLD}  NGO Manager — Build Progress Check{RESET}")
    print(f"{BOLD}{'='*55}{RESET}\n")

    first_incomplete = None

    for i, step in enumerate(steps):
        required_ok = all(check(p) for p in step["required"])
        all_ok = all(check(p) for p in step["checks"])

        if required_ok and all_ok:
            status = f"{GREEN}✅ COMPLETE{RESET}"
        elif required_ok:
            status = f"{YELLOW}⚠️  PARTIAL{RESET}"
            if first_incomplete is None:
                first_incomplete = step["name"]
        else:
            status = f"{RED}❌ NOT STARTED{RESET}"
            if first_incomplete is None:
                first_incomplete = step["name"]

        print(f"  {status}  {step['name']}")

        if not required_ok or not all_ok:
            for p in step["checks"]:
                exists = check(p)
                icon = "  ✓" if exists else "  ✗"
                color = GREEN if exists else RED
                print(f"         {color}{icon} {p}{RESET}")

    print(f"\n{BOLD}{'='*55}{RESET}")

    if first_incomplete:
        print(f"\n{BLUE}{BOLD}▶ RESUME FROM: {first_incomplete}{RESET}")
        print(f"  Read: CLAUDE.md → WAT.md → .claude/topics/07-build-order.md")
        print(f"  Then: workflows/resume-work.md\n")
    else:
        print(f"\n{GREEN}{BOLD}🎉 ALL STEPS COMPLETE{RESET}\n")

    print(f"{BOLD}Git Log (last 10):{RESET}")
    log = git_log()
    if log:
        for line in log.split("\n"):
            print(f"  {line}")
    else:
        print(f"  {RED}No commits yet — run: git init && git add . && git commit -m 'initial'{RESET}")

    status = git_status()
    if status:
        print(f"\n{BOLD}Uncommitted changes:{RESET}")
        for line in status.split("\n"):
            print(f"  {YELLOW}{line}{RESET}")
    else:
        print(f"\n{GREEN}Working tree clean ✓{RESET}")

    print()

if __name__ == "__main__":
    main()
