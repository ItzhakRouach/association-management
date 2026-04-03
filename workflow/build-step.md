# Workflow: Build Step

## Objective
Execute a single build step cleanly, with proper review and commit.

## Steps

### 1. Identify the step
Check `tools/check-progress.py` output and `git log --oneline`.

### 2. Read the relevant topic file
Only the file for this step. See `CLAUDE.md` for the map.

### 3. Read relevant agents + skills
As defined in the topic file. Read agents first, then skills.

### 4. Build
Follow the topic file instructions exactly.
For [PARALLEL] steps: spawn subagents with minimal context per agent.

### 5. Review
```
Read .claude/skills/code-reviewer/SKILL.md
Read .claude/skills/typescript-expert/SKILL.md
Fix ALL issues found.
```

### 6. Commit
```bash
git add .
git commit -m "step X: [description of what was built]"
```

### 7. Update check-progress tool if needed
If new files were created that aren't tracked yet.

## Edge Cases
- **Subagent fails mid-way**: Check what it completed, commit that, then rebuild the failed piece
- **Skill not found**: Continue without it, note it in the commit message
- **Build error**: Fix before committing — never commit broken code
