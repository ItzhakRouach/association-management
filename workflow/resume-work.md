# Workflow: Resume Work

## Objective
Resume the project from exactly where it was left off after a session break or usage reset.

## Required Inputs
- Current state of the codebase (run the check tool)

## Steps

### 1. Check current progress
```bash
python3 tools/check-progress.py
```
This outputs: which steps are complete, which is in progress, what's missing.

### 2. Check git log
```bash
git log --oneline
```
The last commit message tells you exactly which step was completed.
If there are uncommitted changes: `git status` and `git diff` to understand state.

### 3. Read only what's needed
Based on the step you're resuming:
- Read `CLAUDE.md` (index only — always)
- Read `WAT.md` (operating rules — always)
- Read `.claude/topics/07-build-order.md` (to orient yourself)
- Read ONLY the topic file for the current step

Do NOT re-read all topic files — wastes context window.

### 4. Resume from the right place
- If a step was mid-way: continue it, then commit
- If a step was complete but not committed: commit it first, then continue
- If unsure: run code-reviewer on existing code before adding anything new

### 5. Continue with normal build order
Follow `.claude/topics/07-build-order.md` from the current step onward.

## Edge Cases
- **No git history**: Run `git init && git add . && git commit -m "step X: resuming"` first
- **Broken state**: Run code-reviewer before continuing, fix issues, commit, then proceed
- **Missing files**: Check what subagent was supposed to create and rebuild only that piece

## Expected Output
Clean continuation of the build — no duplicate work, no skipped steps.
