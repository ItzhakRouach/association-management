# Agent Instructions — WAT Framework

You're working inside the **WAT framework** (Workflows, Agents, Tools).
This architecture separates concerns so that probabilistic AI handles reasoning
while deterministic code handles execution.

## The WAT Architecture

**Layer 1: Workflows** — Markdown SOPs in `workflows/`
Each workflow defines: objective, inputs, which tools to use, expected outputs, edge cases.

**Layer 2: Agents (You)** — Intelligent coordination
Read the relevant workflow, run tools in the correct sequence, handle failures,
ask clarifying questions when needed. Connect intent to execution.

**Layer 3: Tools** — Python scripts in `tools/`
Deterministic execution: file checks, progress tracking, validation.
Credentials in `.env` only — never hardcoded.

## How to Operate

**1. Check progress before starting**
Always run `tools/check-progress.py` at the start of a session.
It tells you exactly what's been built and where to resume.

**2. Read only the relevant topic file**
Don't load all topic files at once — only the one for your current step.
This preserves context window for actual code generation.

**3. Follow workflows for each step**
Read `workflows/build-step.md` before starting any build step.
Read `workflows/code-review.md` before running code-reviewer.
Read `workflows/resume-work.md` at the start of every new session.

**4. Learn and adapt when things fail**
- Read the full error message
- Fix and retest
- Update the relevant workflow with what you learned
- Never silently swallow errors

**5. Commit after every step**
```bash
git add .
git commit -m "step X: [what was built]"
```

## Self-Improvement Loop
1. Identify what broke
2. Fix the tool or workflow
3. Verify the fix
4. Update the workflow
5. Continue with a stronger system

## File Structure
```
CLAUDE.md           # Index + rules (read first, always)
WAT.md              # This file — how to operate
.claude/
  agents/           # Specialized agent .md files
  skills/           # Skill folders
  topics/           # Topic-specific instructions (read per step)
workflows/          # SOP markdown files
tools/              # Python execution scripts
.env.example        # Template — never store real secrets here
```
